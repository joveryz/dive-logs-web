interface HeaderProps {
  slogan?: string;
}

export function Header({ 
  slogan = 'Deep Dive, Dive Deep' 
}: HeaderProps) {
  return (
    <header 
      className="flex items-center px-3 md:px-4 py-2 bg-dive-surface border-b border-dive-border"
      role="banner"
    >
      <img 
        src={`${import.meta.env.BASE_URL}favicon.svg`}
        alt="Dive Logs"
        className="w-6 h-6 md:w-7 md:h-7 mr-2" 
      />
      <span className="text-cyan-400 font-semibold text-lg">{slogan}</span>
    </header>
  );
}
