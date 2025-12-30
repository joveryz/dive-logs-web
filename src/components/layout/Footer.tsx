interface FooterProps {
  appName?: string;
}

export function Footer({ appName = 'Dive Logs' }: FooterProps) {
  return (
    <footer 
      className="px-4 py-1.5 bg-zinc-800 border-t border-zinc-700 text-center"
      role="contentinfo"
    >
      <span className="text-zinc-500 text-xs">
        © {new Date().getFullYear()} {appName} by{' '}
        <a 
          href="https://redebug.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-amber-500 hover:text-amber-400 transition-colors"
        >
          REDEBUG
        </a>
      </span>
    </footer>
  );
}
