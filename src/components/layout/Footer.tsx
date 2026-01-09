import { parseExporterVersion } from '@/data/csvParser';

export function Footer() {
  const exporterVersion = parseExporterVersion();

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
        </a>. Some rights reserved
        {' | '}
        <span className="text-dive-text-muted text-xs">
          Exporter: {exporterVersion.commit}({exporterVersion.buildDate})
        </span>
        {' | '}
        <span className="text-dive-text-muted text-xs">
          Web: {__APP_COMMIT_HASH__}({__APP_BUILD_DATE__})
        </span>
      </span>
    </footer>
  );
}
