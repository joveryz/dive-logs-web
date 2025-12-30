export function Footer() {
  return (
    <footer 
      className="px-4 py-1.5 bg-dive-surface border-t border-dive-border text-center"
      role="contentinfo"
    >
      <span className="text-dive-text-muted text-xs">
        © {new Date().getFullYear()} {' '}
        <a 
          href="https://redebug.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Jovery Zhang
        </a>. Some rights reserved.
      </span>
    </footer>
  );
}
