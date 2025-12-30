interface FooterProps {
  appName?: string;
}

export function Footer({ appName = 'Dive Logs' }: FooterProps) {
  return (
    <footer 
      className="px-4 py-1.5 bg-gray-800 border-t border-gray-700 text-center"
      role="contentinfo"
    >
      <span className="text-gray-500 text-xs">
        © {new Date().getFullYear()} {appName} by{' '}
        <a 
          href="https://redebug.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          REDEBUG
        </a>
      </span>
    </footer>
  );
}
