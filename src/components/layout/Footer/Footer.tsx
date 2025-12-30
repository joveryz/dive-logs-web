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
        © {new Date().getFullYear()} {appName} • Built with React + TypeScript + Recharts
      </span>
    </footer>
  );
}
