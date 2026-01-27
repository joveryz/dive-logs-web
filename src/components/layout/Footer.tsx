import { parseExporterVersion } from '@/data/csvParser';

interface VersionInfoProps {
  label: string;
  commit: string;
  buildDate: string;
}

function VersionInfo({ label, commit, buildDate }: VersionInfoProps) {
  return <span>{label}: {commit}({buildDate})</span>;
}

export function Footer() {
  const exporterVersion = parseExporterVersion();

  return (
    <footer 
      className="px-4 py-1.5 bg-dive-surface border-t border-dive-border text-center text-dive-text-muted text-xs"
      role="contentinfo"
    >
      © {new Date().getFullYear()}{' '}
      Jovery@
      <a 
        href="https://redebug.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        REDEBUG
      </a>
      . Some rights reserved
      {exporterVersion && (
        <> | <VersionInfo label="Exporter" commit={exporterVersion.commit} buildDate={exporterVersion.buildDate} /></>
      )}
      {' | '}
      <VersionInfo label="Web" commit={__APP_COMMIT_HASH__} buildDate={__APP_BUILD_DATE__} />
    </footer>
  );
}
