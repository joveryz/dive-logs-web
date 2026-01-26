import { useState, useCallback, useRef } from 'react';
import { Upload, X, Eye, EyeOff, Unlock, Lock, CheckCircle, CloudUpload, AlertCircle } from 'lucide-react';
import { decryptPAT, ENCRYPTED_PAT } from '@/utils/crypto';

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
  const [fileName, setFileName] = useState('');  // 非 FIT 文件的文件名
  const [fileExt, setFileExt] = useState('');    // 扩展名（如 .fit）
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  
  // FIT 文件五部分
  const [fitDate, setFitDate] = useState('');
  const [fitBuddy, setFitBuddy] = useState('');
  const [fitLocation, setFitLocation] = useState('');
  const [fitSite, setFitSite] = useState('');
  const [fitDiver, setFitDiver] = useState('');
  
  // 判断是否是 FIT 文件
  const isFitFile = fileExt.toLowerCase() === '.fit';
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 重置文件相关状态
  const resetFileState = useCallback(() => {
    setSelectedFile(null);
    setFileName('');
    setFileExt('');
    setFitDate('');
    setFitBuddy('');
    setFitLocation('');
    setFitSite('');
    setFitDiver('');
    setErrorMessage('');
    setUploadedUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // 重置上传相关状态（保留 token）
  const resetUploadState = useCallback(() => {
    resetFileState();
    setPassword('');
    // 如果已有 token 则直接进入上传步骤
    setStep(token ? 'upload' : 'config');
  }, [token, resetFileState]);

  // 模态框打开时重置状态
  const prevIsOpen = useRef(isOpen);
  if (isOpen && !prevIsOpen.current) {
    resetUploadState();
  }
  prevIsOpen.current = isOpen;

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
      setStep('upload');
    } catch {
      setErrorMessage('Incorrect password');
    } finally {
      setIsDecrypting(false);
    }
  }, [password]);

  // 锁定（清除内存中的 token）
  const lockAccess = useCallback(() => {
    setToken('');
    setPassword('');
    setStep('config');
  }, []);

  // 选择文件
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // 提取扩展名
      const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : '';
      setFileExt(ext);
      
      // FIT 文件尝试解析原始文件名
      if (ext.toLowerCase() === '.fit') {
        const baseName = file.name.replace(/\.[^.]+$/, '');
        const parts = baseName.split('_');
        
        if (parts.length === 5) {
          // 文件名符合五部分格式，自动填入
          setFitDate(parts[0]);
          setFitBuddy(parts[1]);
          setFitLocation(parts[2]);
          setFitSite(parts[3]);
          setFitDiver(parts[4]);
        } else {
          // 不符合格式，只填入今天日期
          const today = new Date();
          const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
          setFitDate(dateStr);
          setFitBuddy('');
          setFitLocation('');
          setFitSite('');
          setFitDiver('');
        }
      } else {
        // 非 FIT 文件：使用原始文件名（不含扩展名）
        const baseName = file.name.replace(/\.[^.]+$/, '');
        setFileName(baseName);
      }
    }
  }, []);

  // 校验单个字段：只允许英文字母、数字、连字符、点（不允许下划线，因为下划线用作分隔符）
  const validateField = useCallback((value: string, fieldName: string): string | null => {
    if (!value.trim()) {
      return `${fieldName} is required`;
    }
    if (!/^[a-zA-Z0-9\-.]+$/.test(value)) {
      return `${fieldName} can only contain letters, numbers, hyphens, dots`;
    }
    return null;
  }, []);

  // 校验 FIT 文件所有字段
  const validateFitFields = useCallback((): string | null => {
    // 日期必须是8位数字
    if (!/^\d{8}$/.test(fitDate)) {
      return 'Date must be 8 digits (YYYYMMDD)';
    }
    const buddyErr = validateField(fitBuddy, 'Buddy');
    if (buddyErr) return buddyErr;
    const locationErr = validateField(fitLocation, 'Location');
    if (locationErr) return locationErr;
    const siteErr = validateField(fitSite, 'Site');
    if (siteErr) return siteErr;
    const diverErr = validateField(fitDiver, 'Diver');
    if (diverErr) return diverErr;
    return null;
  }, [fitDate, fitBuddy, fitLocation, fitSite, fitDiver, validateField]);

  // 上传文件到 GitHub
  const uploadToGitHub = useCallback(async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a file');
      return;
    }

    // FIT 文件校验五部分
    let finalFileName: string;
    if (isFitFile) {
      const validationError = validateFitFields();
      if (validationError) {
        setErrorMessage(validationError);
        return;
      }
      finalFileName = `${fitDate}_${fitBuddy}_${fitLocation}_${fitSite}_${fitDiver}${fileExt}`;
    } else {
      if (!fileName.trim()) {
        setErrorMessage('Please enter filename');
        return;
      }
      finalFileName = `${fileName.trim()}${fileExt}`;
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

      const apiUrl = `https://api.github.com/repos/${REPO}/contents/data/${finalFileName}`;

      // 先检查文件是否已存在，获取 sha（用于覆盖）
      let existingSha: string | undefined;
      try {
        const checkResponse = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });
        if (checkResponse.ok) {
          const existingFile = await checkResponse.json();
          existingSha = existingFile.sha;
        }
      } catch {
        // 文件不存在，忽略错误
      }

      // 调用 GitHub API（创建或更新）
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          message: existingSha 
            ? `Update dive log: ${finalFileName}` 
            : `Add dive log: ${finalFileName}`,
          content: fileContent,
          ...(existingSha && { sha: existingSha }),
        }),
      });

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
  }, [selectedFile, fileName, fileExt, token, isFitFile, validateFitFields, fitDate, fitBuddy, fitLocation, fitSite, fitDiver]);

  // 重新上传（清空所有设置）
  const resetUpload = useCallback(() => {
    resetFileState();
    setStep('upload');
  }, [resetFileState]);

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

                {/* File Name - FIT 文件显示5个字段，其他文件显示单一输入框 */}
                {selectedFile && isFitFile && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-dive-text-secondary mb-1">Date (YYYYMMDD)</label>
                        <input
                          type="text"
                          value={fitDate}
                          onChange={(e) => setFitDate(e.target.value)}
                          placeholder="20260126"
                          className="w-full px-2 py-1.5 bg-dive-card border border-dive-border rounded text-dive-text placeholder-dive-text-muted focus:outline-none focus:border-cyan-500/50 font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-dive-text-secondary mb-1">Buddy</label>
                        <input
                          type="text"
                          value={fitBuddy}
                          onChange={(e) => setFitBuddy(e.target.value)}
                          placeholder="Solo"
                          className="w-full px-2 py-1.5 bg-dive-card border border-dive-border rounded text-dive-text placeholder-dive-text-muted focus:outline-none focus:border-cyan-500/50 font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-dive-text-secondary mb-1">Location</label>
                        <input
                          type="text"
                          value={fitLocation}
                          onChange={(e) => setFitLocation(e.target.value)}
                          placeholder="Beijing"
                          className="w-full px-2 py-1.5 bg-dive-card border border-dive-border rounded text-dive-text placeholder-dive-text-muted focus:outline-none focus:border-cyan-500/50 font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-dive-text-secondary mb-1">Site</label>
                        <input
                          type="text"
                          value={fitSite}
                          onChange={(e) => setFitSite(e.target.value)}
                          placeholder="HiDive"
                          className="w-full px-2 py-1.5 bg-dive-card border border-dive-border rounded text-dive-text placeholder-dive-text-muted focus:outline-none focus:border-cyan-500/50 font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-dive-text-secondary mb-1">Diver</label>
                      <input
                        type="text"
                        value={fitDiver}
                        onChange={(e) => setFitDiver(e.target.value)}
                        placeholder="Jovery"
                        className="w-full px-2 py-1.5 bg-dive-card border border-dive-border rounded text-dive-text placeholder-dive-text-muted focus:outline-none focus:border-cyan-500/50 font-mono text-sm"
                      />
                    </div>
                    <p className="text-xs text-dive-text-muted">
                      Preview: <span className="font-mono text-cyan-400">{fitDate}_{fitBuddy}_{fitLocation}_{fitSite}_{fitDiver}.fit</span>
                    </p>
                  </div>
                )}

                {selectedFile && !isFitFile && (
                  <div>
                    <label className="block text-sm text-dive-text-secondary mb-1">
                      Filename
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="filename"
                        className="flex-1 px-3 py-2 bg-dive-card border border-dive-border rounded-lg text-dive-text placeholder-dive-text-muted focus:outline-none focus:border-cyan-500/50 font-mono text-sm"
                      />
                      <span className="text-dive-text-muted font-mono text-sm">{fileExt}</span>
                    </div>
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
                  disabled={
                    !selectedFile || 
                    (isFitFile 
                      ? !fitDate || !fitBuddy || !fitLocation || !fitSite || !fitDiver
                      : !fileName.trim())
                  }
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
