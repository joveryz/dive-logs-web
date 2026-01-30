import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { X, Eye, EyeOff, Unlock, Lock, CheckCircle, CloudUpload, AlertCircle, Trash2, Pencil, Loader2, Settings } from 'lucide-react';
import { decryptPAT, ENCRYPTED_PAT } from '@/utils/crypto';
import { useDiveStore } from '@/store';
import { selectDives } from '@/store/selectors';

// 固定仓库地址
const REPO = 'joveryz/dive-logs';

interface DiveDataManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

type UploadStep = 'config' | 'upload' | 'uploading' | 'success' | 'error';
type ActiveTab = 'upload' | 'manage';

interface GitHubFile {
  name: string;
  sha: string;
  size: number;
  download_url: string;
}

/**
 * 潜水日志管理模态框
 * 支持上传和管理 GitHub 仓库中的 FIT、DB 等文件
 */
export function DiveDataManagement({ isOpen, onClose }: DiveDataManagementProps) {
  // 从 store 获取已有潜水记录，生成候选项
  const dives = useDiveStore(selectDives);
  
  const fieldOptions = useMemo(() => {
    const buddySet = new Set<string>(['Solo']);
    const diverSet = new Set<string>();
    const locationSet = new Set<string>();
    const siteSet = new Set<string>();
    const tagSet = new Set<string>();
    
    for (const dive of dives) {
      if (dive.buddy) buddySet.add(dive.buddy);
      if (dive.diver) diverSet.add(dive.diver);
      if (dive.location) locationSet.add(dive.location);
      if (dive.site) siteSet.add(dive.site);
      if (dive.tags) {
        for (const tag of dive.tags) {
          tagSet.add(tag);
        }
      }
    }
    
    return {
      buddy: Array.from(buddySet).sort(),
      diver: Array.from(diverSet).sort(),
      location: Array.from(locationSet).sort(),
      site: Array.from(siteSet).sort(),
      tag: Array.from(tagSet).sort(),
    };
  }, [dives]);

  // Tab 状态
  const [activeTab, setActiveTab] = useState<ActiveTab>('upload');

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
  
  // FIT 文件字段: Date, Diver, Buddy, Location, Site, Tag(可选)
  const [fitDate, setFitDate] = useState('');
  const [fitDiver, setFitDiver] = useState('');
  const [fitBuddy, setFitBuddy] = useState('');
  const [fitLocation, setFitLocation] = useState('');
  const [fitSite, setFitSite] = useState('');
  const [fitTag, setFitTag] = useState('');
  
  // Manage 状态
  const [files, setFiles] = useState<GitHubFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [manageError, setManageError] = useState('');
  const [editingFile, setEditingFile] = useState<GitHubFile | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<GitHubFile | null>(null);
  
  // 判断是否是 FIT 文件
  const isFitFile = fileExt.toLowerCase() === '.fit';
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 重置文件相关状态
  const resetFileState = useCallback(() => {
    setSelectedFile(null);
    setFileName('');
    setFileExt('');
    setFitDate('');
    setFitDiver('');
    setFitBuddy('');
    setFitLocation('');
    setFitSite('');
    setFitTag('');
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
        
        if (parts.length >= 5 && parts.length <= 6) {
          // 文件名符合格式，自动填入
          setFitDate(parts[0]);
          setFitDiver(parts[1]);
          setFitBuddy(parts[2]);
          setFitLocation(parts[3]);
          setFitSite(parts[4]);
          setFitTag(parts[5] || '');  // 第6部分为可选 Tag
        } else {
          // 不符合格式，只填入今天日期
          const today = new Date();
          const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
          setFitDate(dateStr);
          setFitDiver('Jovery');
          setFitBuddy('Solo');
          setFitLocation('Beijing');
          setFitSite('HiDive');
          setFitTag('');
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
    const diverErr = validateField(fitDiver, 'Diver');
    if (diverErr) return diverErr;
    const buddyErr = validateField(fitBuddy, 'Buddy');
    if (buddyErr) return buddyErr;
    const locationErr = validateField(fitLocation, 'Location');
    if (locationErr) return locationErr;
    const siteErr = validateField(fitSite, 'Site');
    if (siteErr) return siteErr;
    // Tag 是可选的，但如果填了要校验格式
    if (fitTag.trim() && !/^[a-zA-Z0-9\-.]+$/.test(fitTag)) {
      return 'Tag can only contain letters, numbers, hyphens, dots';
    }
    return null;
  }, [fitDate, fitDiver, fitBuddy, fitLocation, fitSite, fitTag, validateField]);

  // 上传文件到 GitHub
  const uploadToGitHub = useCallback(async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a file');
      return;
    }

    // FIT 文件校验
    let finalFileName: string;
    if (isFitFile) {
      const validationError = validateFitFields();
      if (validationError) {
        setErrorMessage(validationError);
        return;
      }
      // 如果有 Tag 则添加到文件名
      const tagPart = fitTag.trim() ? `_${fitTag.trim()}` : '';
      finalFileName = `${fitDate}_${fitDiver}_${fitBuddy}_${fitLocation}_${fitSite}${tagPart}${fileExt}`;
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

  // ==================== Manage 功能 ====================
  
  // 获取文件列表
  const fetchFiles = useCallback(async () => {
    if (!token) return;
    
    setIsLoadingFiles(true);
    setManageError('');
    
    try {
      const response = await fetch(
        `https://api.github.com/repos/${REPO}/contents/data`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.status}`);
      }
      
      const data = await response.json();
      // 过滤只显示文件，排除目录
      const fileList: GitHubFile[] = data
        .filter((item: { type: string }) => item.type === 'file')
        .map((item: { name: string; sha: string; size: number; download_url: string }) => ({
          name: item.name,
          sha: item.sha,
          size: item.size,
          download_url: item.download_url,
        }))
        .sort((a: GitHubFile, b: GitHubFile) => b.name.localeCompare(a.name)); // 按名称倒序（最新的在前）
      
      setFiles(fileList);
    } catch (err) {
      setManageError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setIsLoadingFiles(false);
    }
  }, [token]);

  // 切换到 Manage tab 时加载文件列表
  useEffect(() => {
    if (activeTab === 'manage' && token && files.length === 0) {
      fetchFiles();
    }
  }, [activeTab, token, files.length, fetchFiles]);

  // 删除文件
  const deleteFile = useCallback(async (file: GitHubFile) => {
    if (!token) return;
    
    setIsProcessing(true);
    setManageError('');
    
    try {
      const response = await fetch(
        `https://api.github.com/repos/${REPO}/contents/data/${file.name}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json',
          },
          body: JSON.stringify({
            message: `Delete dive log: ${file.name}`,
            sha: file.sha,
          }),
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      }
      
      // 刷新文件列表
      setDeleteConfirm(null);
      await fetchFiles();
    } catch (err) {
      setManageError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setIsProcessing(false);
    }
  }, [token, fetchFiles]);

  // 重命名文件
  const renameFile = useCallback(async () => {
    if (!token || !editingFile || !newFileName.trim()) return;
    
    const trimmedName = newFileName.trim();
    if (trimmedName === editingFile.name) {
      setEditingFile(null);
      return;
    }
    
    setIsProcessing(true);
    setManageError('');
    
    try {
      // 1. 获取原文件信息
      const getResponse = await fetch(
        `https://api.github.com/repos/${REPO}/contents/data/${editingFile.name}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );
      
      if (!getResponse.ok) {
        throw new Error('Failed to get file info');
      }
      
      const fileData = await getResponse.json();
      
      // 2. 获取文件实际内容（通过 download_url 下载，确保获取完整内容）
      let base64Content: string;
      
      if (fileData.content) {
        // 小文件：API 直接返回 content（去掉换行符）
        base64Content = fileData.content.replace(/\n/g, '');
      } else if (fileData.download_url) {
        // 大文件/二进制文件：通过 download_url 下载
        const downloadResponse = await fetch(fileData.download_url);
        if (!downloadResponse.ok) {
          throw new Error('Failed to download file content');
        }
        const blob = await downloadResponse.blob();
        // 转换为 base64
        base64Content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // 移除 data:xxx;base64, 前缀
            resolve(result.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        throw new Error('Cannot get file content');
      }
      
      // 3. 创建新文件
      const createResponse = await fetch(
        `https://api.github.com/repos/${REPO}/contents/data/${trimmedName}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json',
          },
          body: JSON.stringify({
            message: `Rename: ${editingFile.name} -> ${trimmedName}`,
            content: base64Content,
          }),
        }
      );
      
      if (!createResponse.ok) {
        const error = await createResponse.json();
        throw new Error(error.message || 'Failed to create new file');
      }
      
      // 验证新文件确实创建成功
      const createResult = await createResponse.json();
      if (!createResult.content?.sha) {
        throw new Error('New file creation not confirmed');
      }
      
      // 4. 只有在新文件确认创建成功后才删除原文件
      // 重新获取原文件的最新 sha（避免并发问题）
      const recheckResponse = await fetch(
        `https://api.github.com/repos/${REPO}/contents/data/${editingFile.name}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );
      
      if (!recheckResponse.ok) {
        // 原文件可能已被删除，忽略
        setEditingFile(null);
        setNewFileName('');
        await fetchFiles();
        return;
      }
      
      const recheckData = await recheckResponse.json();
      
      const deleteResponse = await fetch(
        `https://api.github.com/repos/${REPO}/contents/data/${editingFile.name}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json',
          },
          body: JSON.stringify({
            message: `Rename: delete old file ${editingFile.name}`,
            sha: recheckData.sha, // 使用最新的 sha
          }),
        }
      );
      
      if (!deleteResponse.ok) {
        const error = await deleteResponse.json();
        throw new Error(error.message || 'Failed to delete old file');
      }
      
      // 刷新文件列表
      setEditingFile(null);
      setNewFileName('');
      await fetchFiles();
    } catch (err) {
      setManageError(err instanceof Error ? err.message : 'Rename failed');
    } finally {
      setIsProcessing(false);
    }
  }, [token, editingFile, newFileName, fetchFiles]);

  // 开始编辑文件名
  const startRename = useCallback((file: GitHubFile) => {
    setEditingFile(file);
    setNewFileName(file.name);
    setDeleteConfirm(null);
  }, []);

  // 取消编辑
  const cancelRename = useCallback(() => {
    setEditingFile(null);
    setNewFileName('');
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-dive-surface border border-dive-border rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-dive-border">
          <h2 className="text-cyan-400 font-semibold text-lg flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Dive Log Management
          </h2>
          <button
            onClick={onClose}
            className="text-dive-text-muted hover:text-dive-text transition-colors p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs - 只在解锁后显示 */}
        {token && step !== 'config' && (
          <div className="flex border-b border-dive-border">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-dive-text-muted hover:text-dive-text'
              }`}
            >
              Upload
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                activeTab === 'manage'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-dive-text-muted hover:text-dive-text'
              }`}
            >
              Manage
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Config Step - Password Input */}
          {step === 'config' && (
            <>
              <div className="text-sm text-dive-text-muted mb-4">
                Enter password to unlock
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
          {step === 'upload' && activeTab === 'upload' && (
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
                    {/* Datalists for autocomplete */}
                    <datalist id="buddy-options">
                      {fieldOptions.buddy.map(opt => <option key={opt} value={opt} />)}
                    </datalist>
                    <datalist id="diver-options">
                      {fieldOptions.diver.map(opt => <option key={opt} value={opt} />)}
                    </datalist>
                    <datalist id="location-options">
                      {fieldOptions.location.map(opt => <option key={opt} value={opt} />)}
                    </datalist>
                    <datalist id="site-options">
                      {fieldOptions.site.map(opt => <option key={opt} value={opt} />)}
                    </datalist>
                    <datalist id="tag-options">
                      {fieldOptions.tag.map(opt => <option key={opt} value={opt} />)}
                    </datalist>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-dive-text-secondary mb-1">Date</label>
                        <input
                          type="text"
                          value={fitDate}
                          onChange={(e) => setFitDate(e.target.value)}
                          placeholder="YYYYMMDD"
                          className="w-full px-2 py-1.5 bg-dive-card border border-dive-border rounded text-dive-text placeholder-dive-text-muted focus:outline-none focus:border-cyan-500/50 font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-dive-text-secondary mb-1">Diver</label>
                        <input
                          type="text"
                          list="diver-options"
                          value={fitDiver}
                          onChange={(e) => setFitDiver(e.target.value)}
                          placeholder="Jovery"
                          className="w-full px-2 py-1.5 bg-dive-card border border-dive-border rounded text-dive-text placeholder-dive-text-muted focus:outline-none focus:border-cyan-500/50 font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-dive-text-secondary mb-1">Buddy</label>
                        <input
                          type="text"
                          list="buddy-options"
                          value={fitBuddy}
                          onChange={(e) => setFitBuddy(e.target.value)}
                          placeholder="Solo"
                          className="w-full px-2 py-1.5 bg-dive-card border border-dive-border rounded text-dive-text placeholder-dive-text-muted focus:outline-none focus:border-cyan-500/50 font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-dive-text-secondary mb-1">Location</label>
                        <input
                          type="text"
                          list="location-options"
                          value={fitLocation}
                          onChange={(e) => setFitLocation(e.target.value)}
                          placeholder="Beijing"
                          className="w-full px-2 py-1.5 bg-dive-card border border-dive-border rounded text-dive-text placeholder-dive-text-muted focus:outline-none focus:border-cyan-500/50 font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-dive-text-secondary mb-1">Site</label>
                        <input
                          type="text"
                          list="site-options"
                          value={fitSite}
                          onChange={(e) => setFitSite(e.target.value)}
                          placeholder="HiDive"
                          className="w-full px-2 py-1.5 bg-dive-card border border-dive-border rounded text-dive-text placeholder-dive-text-muted focus:outline-none focus:border-cyan-500/50 font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-dive-text-secondary mb-1">Tag <span className="text-dive-text-muted/60">(opt)</span></label>
                        <input
                          type="text"
                          list="tag-options"
                          value={fitTag}
                          onChange={(e) => setFitTag(e.target.value.toUpperCase())}
                          className="w-full px-2 py-1.5 bg-dive-card border border-dive-border rounded text-dive-text placeholder-dive-text-muted focus:outline-none focus:border-cyan-500/50 font-mono text-sm uppercase"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-dive-text-muted">
                      <span className="font-mono text-cyan-400">{fitDate}_{fitDiver}_{fitBuddy}_{fitLocation}_{fitSite}{fitTag.trim() ? `_${fitTag.trim()}` : ''}.fit</span>
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
                      ? !fitDate || !fitDiver || !fitBuddy || !fitLocation || !fitSite
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
          {step === 'uploading' && activeTab === 'upload' && (
            <div className="flex flex-col items-center py-8 cursor-default select-none">
              <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
              <span className="text-dive-text">Uploading...</span>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && activeTab === 'upload' && (
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
          {step === 'error' && activeTab === 'upload' && (
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

          {/* Manage Tab */}
          {activeTab === 'manage' && token && (
            <div className="space-y-3">
              {/* Error Message */}
              {manageError && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{manageError}</span>
                </div>
              )}

              {/* Loading */}
              {isLoadingFiles && (
                <div className="flex flex-col items-center py-8">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
                  <span className="text-dive-text-muted text-sm">Loading files...</span>
                </div>
              )}

              {/* File List */}
              {!isLoadingFiles && files.length === 0 && (
                <div className="text-center py-8 text-dive-text-muted">
                  No files found
                </div>
              )}

              {!isLoadingFiles && files.length > 0 && (
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.sha}
                      className="flex items-center gap-2 p-2 bg-dive-card rounded-lg border border-dive-border"
                    >
                      {editingFile?.sha === file.sha ? (
                        // 编辑模式
                        <div className="flex-1 flex flex-col gap-2">
                          <input
                            type="text"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            className="w-full px-2 py-1 bg-dive-surface border border-dive-border rounded text-dive-text font-mono text-xs focus:outline-none focus:border-cyan-500/50"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={renameFile}
                              disabled={isProcessing || !newFileName.trim() || newFileName === file.name}
                              className="flex-1 py-1 text-xs bg-cyan-600 hover:bg-cyan-500 disabled:bg-dive-card disabled:text-dive-text-muted text-white rounded transition-colors"
                            >
                              {isProcessing ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={cancelRename}
                              disabled={isProcessing}
                              className="flex-1 py-1 text-xs border border-dive-border text-dive-text-muted hover:text-dive-text rounded transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : deleteConfirm?.sha === file.sha ? (
                        // 删除确认模式
                        <div className="flex-1 flex flex-col gap-2">
                          <p className="text-xs text-red-400">Delete "{file.name}"?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => deleteFile(file)}
                              disabled={isProcessing}
                              className="flex-1 py-1 text-xs bg-red-600 hover:bg-red-500 disabled:bg-dive-card disabled:text-dive-text-muted text-white rounded transition-colors"
                            >
                              {isProcessing ? 'Deleting...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              disabled={isProcessing}
                              className="flex-1 py-1 text-xs border border-dive-border text-dive-text-muted hover:text-dive-text rounded transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // 正常显示模式
                        <>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-dive-text font-mono truncate">{file.name}</p>
                            <p className="text-xs text-dive-text-muted">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <button
                            onClick={() => startRename(file)}
                            className="p-1.5 text-dive-text-muted hover:text-cyan-400 transition-colors"
                            title="Rename"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(file)}
                            className="p-1.5 text-dive-text-muted hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Refresh Button */}
              {!isLoadingFiles && (
                <button
                  onClick={fetchFiles}
                  className="w-full py-2 text-sm border border-dive-border text-dive-text-muted hover:text-dive-text rounded-lg transition-colors"
                >
                  Refresh
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer - Lock button */}
        {token && (step === 'upload' || activeTab === 'manage') && (
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
