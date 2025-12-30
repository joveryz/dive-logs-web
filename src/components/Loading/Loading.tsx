import { Loader2 } from 'lucide-react';
import { CSSProperties } from 'react';

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

// 骨架屏组件
export function Skeleton({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={`animate-pulse bg-gray-700 rounded ${className}`} style={style} />
  );
}

// 列表骨架屏
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}

// 图表骨架屏
export function ChartSkeleton() {
  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 flex items-end gap-1 pb-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${30 + Math.random() * 50}%` }}
          />
        ))}
      </div>
      <Skeleton className="h-4 w-full" />
    </div>
  );
}
