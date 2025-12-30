import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Loading({ message = 'Loading...', size = 'md' }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-gray-400">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-cyan-400 mb-3`} />
      <span className="text-sm">{message}</span>
    </div>
  );
}
