import { Search, X } from 'lucide-react';
import { useId } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  suffix?: React.ReactNode;
  'aria-label'?: string;
}

export function SearchInput({ 
  value, 
  onChange, 
  placeholder = 'Search...', 
  className = '',
  suffix,
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
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel || placeholder}
        className={`w-full pl-10 py-2 bg-dive-card border border-dive-border rounded-lg 
                   text-dive-text placeholder-dive-text-muted text-sm
                   focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent ${suffix ? 'pr-20' : 'pr-10'}`}
      />
      {suffix && (
        <span className="absolute right-10 top-1/2 -translate-y-1/2 text-xs tabular-nums text-dive-text-muted pointer-events-none">
          {suffix}
        </span>
      )}
      <button
        type="button"
        onClick={() => onChange('')}
        className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors ${
          value ? 'text-dive-text-muted hover:text-dive-text' : 'text-dive-text-muted/30'
        }`}
        aria-label="Clear search"
        disabled={!value}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
