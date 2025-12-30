import { Search } from 'lucide-react';
import { useId } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  'aria-label'?: string;
}

export function SearchInput({ 
  value, 
  onChange, 
  placeholder = 'Search...', 
  className = '',
  'aria-label': ariaLabel,
}: SearchInputProps) {
  const inputId = useId();
  
  return (
    <div className={`relative ${className}`}>
      <label htmlFor={inputId} className="sr-only">
        {ariaLabel || placeholder}
      </label>
      <Search 
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dive-text-secondary" 
        aria-hidden="true"
      />
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel || placeholder}
        className="w-full pl-10 pr-4 py-2 bg-dive-card border border-dive-border rounded-lg 
                   text-dive-text placeholder-dive-text-muted text-sm
                   focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
      />
    </div>
  );
}
