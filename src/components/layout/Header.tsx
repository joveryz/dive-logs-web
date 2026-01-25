import { useState } from 'react';
import { Upload } from 'lucide-react';
import { UploadModal } from '@/components/features';

interface HeaderProps {
  slogan?: string;
}

export function Header({ 
  slogan = 'Deep Dive, Dive Deep' 
}: HeaderProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <>
      <header 
        className="flex items-center justify-between px-3 md:px-4 py-2 bg-dive-surface border-b border-dive-border"
        role="banner"
      >
        <div className="flex items-center">
          <a 
            href={import.meta.env.BASE_URL}
            className="flex-shrink-0 hover:opacity-80 transition-opacity"
            title="Home"
          >
            <img 
              src={`${import.meta.env.BASE_URL}favicon.svg`}
              alt="Dive Logs"
              className="w-6 h-6 md:w-7 md:h-7 mr-2" 
            />
          </a>
          <span className="text-cyan-400 font-semibold text-lg">{slogan}</span>
        </div>
        
        {/* 上传按钮 */}
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-cyan-400 hover:text-cyan-300 hover:bg-dive-card/50 rounded-lg transition-all"
          title="Upload FIT File"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Upload</span>
        </button>
      </header>
      
      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </>
  );
}
