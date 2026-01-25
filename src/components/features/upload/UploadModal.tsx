import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, X, Eye, EyeOff, Unlock, Lock, CheckCircle, CloudUpload, AlertCircle } from 'lucide-react';
import { decryptPAT, ENCRYPTED_PAT } from '@/utils/crypto';

// localStorage keys
const STORAGE_KEY_UNLOCKED = 'upload_unlocked';

// 固定仓库地址
const REPO = 'joveryz/dive-logs';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type UploadStep = 'config' | 'upload' | 'uploading' | 'success' | 'error';

/**
 * 潜水日志文件上传到 GitHub 的模态框
 * 支持 FIT、CSV 等格式
 */
export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  // 配置状态
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  
  // 上传状态
  const [step, setStep] = useState<UploadStep>('config');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');  // 不含扩展名的文件名
  const [fileExt, setFileExt] = useState('');    // 扩展名（如 .fit）
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 加载保存的状态
  useEffect(() => {
    if (isOpen) {
      // 检查是否有缓存的解密后 token（会话级别）
      const cachedToken = sessionStorage.getItem(STORAGE_KEY_UNLOCKED) || '';
      setToken(cachedToken);
      setStep(cachedToken ? 'upload' : 'config');
      setSelectedFile(null);
      setFileName('');
      setFileExt('');
      setErrorMessage('');
      setUploadedUrl('');
      setPassword('');
    }
  }, [isOpen]);

  // 解密并保存
  const unlockWithPassword = useCallback(() => {
    if (!password.trim()) {
      setErrorMessage('Please enter password');
      return;
    }
    if (!ENCRYPTED_PAT) {
      setErrorMessage('Encrypted PAT not configured');
      return;
    }
    
    setIsDecrypting(true);
    setErrorMessage('');
    
    try {
      const decryptedToken = decryptPAT(ENCRYPTED_PAT, password.trim());
      setToken(decryptedToken);
      // 仅保存到 sessionStorage（关闭浏览器后清除）
      sessionStorage.setItem(STORAGE_KEY_UNLOCKED, decryptedToken);
      setStep('upload');
    } catch {
      setErrorMessage('Incorrect password');
    } finally {
      setIsDecrypting(false);
    }
  }, [password]);

  // 锁定（清除解密的 token）
  const lockAccess = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY_UNLOCKED);
    setToken('');
    setPassword('');
    setStep('config');
  }, []);

  // 生成默认文件名（不含扩展名）
  const generateDefaultFileName = useCallback((file: File) => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    // 获取不含扩展名的文件名
    const baseName = file.name.replace(/\.[^.]+$/, '');
    return `${dateStr}_${baseName}`;
  }, []);

  // 选择文件
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(generateDefaultFileName(file));
      // 提取扩展名
      const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : '';
      setFileExt(ext);
    }
  }, [generateDefaultFileName]);

  // 校验 FIT 文件名格式：{Date}_{Buddy}_{Location}_{Site}_{Diver}
  const validateFitFileName = useCallback((name: string): string | null => {
    // 只允许英文字母、数字、下划线、连字符、点
    if (!/^[a-zA-Z0-9_\-.]+$/.test(name)) {
      return 'Filename can only contain letters, numbers, underscores, hyphens';
    }
    // 格式：YYYYMMDD_Buddy_Location_Site_Diver
    const parts = name.split('_');
    if (parts.length < 5) {
      return 'Filename should have at least 5 parts';
    }
    return null;
  }, []);

  // 上传文件到 GitHub
  const uploadToGitHub = useCallback(async () => {
    if (!selectedFile || !fileName.trim()) {
      setErrorMessage('Please select a file and enter filename');
      return;
    }

    // FIT 文件校验文件名格式
    if (fileExt.toLowerCase() === '.fit') {
      const validationError = validateFitFileName(fileName.trim());
      if (validationError) {
        setErrorMessage(validationError);
        return;
      }
    }

    setStep('uploading');
    setErrorMessage('');

    try {
      // 读取文件为 Base64
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      // 使用用户输入的文件名 + 原扩展名
      const finalFileName = `${fileName.trim()}${fileExt}`;

      // 调用 GitHub API
      const response = await fetch(
        `https://api.github.com/repos/${REPO}/contents/data/${finalFileName}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json',
          },
          body: JSON.stringify({
            message: `Add dive log: ${finalFileName}`,
            content: fileContent,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      setUploadedUrl(result.content?.html_url || '');
      setStep('success');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed');
      setStep('error');
    }
  }, [selectedFile, fileName, token]);

  // 重新上传（清空所有设置）
  const resetUpload = useCallback(() => {
    setSelectedFile(null);
    setFileName('');
    setFileExt('');
    setErrorMessage('');
    setUploadedUrl('');
    setStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // 重试上传（保留文件设置）
  const retryUpload = useCallback(() => {
    setErrorMessage('');
    setStep('upload');
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-dive-surface border border-dive-border rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-dive-border">
          <h2 className="text-cyan-400 font-semibold text-lg flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Dive Log
          </h2>
          <button
            onClick={onClose}
            className="text-dive-text-muted hover:text-dive-text transition-colors p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Config Step - Password Input */}
          {step === 'config' && (
            <>
              <div className="text-sm text-dive-text-muted mb-4">
                Enter password to unlock upload feature
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-dive-text-secondary mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && unlockWithPassword()}
                      placeholder="Enter password"
                      className="w-full px-3 py-2 pr-10 bg-dive-card border border-dive-border rounded-lg text-dive-text placeholder-dive-text-muted focus:outline-none focus:border-cyan-500/50"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-dive-text-muted hover:text-dive-text"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                onClick={unlockWithPassword}
                disabled={isDecrypting || !password.trim()}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-dive-card disabled:text-dive-text-muted text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isDecrypting ? (
                  <>
                    <Unlock className="w-4 h-4 animate-pulse" />
                    Unlocking...
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    Unlock
                  </>
                )}
              </button>
            </>
          )}

          {/* Upload Step */}
          {step === 'upload' && (
            <>
              <div className="space-y-4">
                {/* File Select */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".fit,.db"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="fit-file-input"
                  />
                  <label
                    htmlFor="fit-file-input"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-dive-border rounded-xl cursor-pointer hover:border-cyan-500/50 hover:bg-dive-card/30 transition-all"
                  >
                    {selectedFile ? (
                      <>
                        <CheckCircle className="w-8 h-8 text-cyan-400 mb-2" />
                        <span className="text-dive-text font-medium">{selectedFile.name}</span>
                        <span className="text-dive-text-muted text-sm">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                      </>
                    ) : (
                      <>
                        <CloudUpload className="w-8 h-8 text-dive-text-muted mb-2" />
                        <span className="text-dive-text-muted">Click to select file</span>
                      </>
                    )}
                  </label>
                </div>

                {/* File Name */}
                {selectedFile && (
                  <div>
                    <label className="block text-sm text-dive-text-secondary mb-1">
                      Filename
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="Date_Buddy_Location_Site_Diver"
                        className="flex-1 px-3 py-2 bg-dive-card border border-dive-border rounded-lg text-dive-text placeholder-dive-text-muted focus:outline-none focus:border-cyan-500/50 font-mono text-sm"
                      />
                      <span className="text-dive-text-muted font-mono text-sm">{fileExt}</span>
                    </div>
                    <p className="text-xs text-dive-text-muted mt-1">
                      Suggested format: {'{Date}_{Buddy}_{Location}_{Site}_{Diver}'}
                    </p>
                  </div>
                )}

                {errorMessage && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={(e) => {
                    (e.target as HTMLButtonElement).blur();
                    uploadToGitHub();
                  }}
                  disabled={!selectedFile || !fileName.trim()}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-dive-card disabled:text-dive-text-muted text-white font-medium rounded-lg transition-colors"
                >
                  Upload
                </button>
              </div>
            </>
          )}

          {/* Uploading Step */}
          {step === 'uploading' && (
            <div className="flex flex-col items-center py-8 cursor-default select-none">
              <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
              <span className="text-dive-text">Uploading...</span>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dive-text mb-2">Upload Successful!</h3>
              <p className="text-dive-text-muted text-sm mb-4">
                File has been committed to GitHub repository
              </p>
              {uploadedUrl && (
                <a 
                  href={uploadedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline text-sm"
                >
                  View file →
                </a>
              )}
              <div className="flex gap-2 mt-6">
                <button
                  onClick={resetUpload}
                  className="flex-1 py-2 border border-dive-border text-dive-text-secondary hover:text-dive-text rounded-lg transition-colors"
                >
                  Upload Another
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Error Step */}
          {step === 'error' && (
            <div className="text-center py-6">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dive-text mb-2">Upload Failed</h3>
              <p className="text-red-400 text-sm mb-4">{errorMessage}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep('config')}
                  className="flex-1 py-2 border border-dive-border text-dive-text-secondary hover:text-dive-text rounded-lg transition-colors"
                >
                  Check Settings
                </button>
                <button
                  onClick={retryUpload}
                  className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Lock button */}
        {step === 'upload' && (
          <div className="px-4 py-3 border-t border-dive-border bg-dive-card/30 flex items-center justify-between">
            <span className="text-xs text-green-400 flex items-center gap-1">
              <Unlock className="w-3.5 h-3.5" />
              Unlocked
            </span>
            <button
              onClick={lockAccess}
              className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
            >
              <Lock className="w-3.5 h-3.5" />
              Lock
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
