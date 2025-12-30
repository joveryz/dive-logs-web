interface HeaderProps {
  title?: string;
  slogan?: string;
}

export function Header({ 
  title = 'Dive Logs', 
  slogan = 'Deep Dive, Dive Deep' 
}: HeaderProps) {
  return (
    <header 
      className="flex items-center px-3 md:px-4 py-2 bg-gray-800 border-b border-gray-700"
      role="banner"
    >
      <img 
        src={`${import.meta.env.BASE_URL}favicon.svg`}
        alt="Dive Logs"
        className="w-6 h-6 md:w-7 md:h-7 mr-2" 
      />
      <h1 className="text-lg md:text-xl font-bold text-white">{title}</h1>
      <span className="hidden sm:inline text-cyan-400 text-sm italic ml-3">{slogan}</span>
    </header>
  );
}
