interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ 
  title = 'Dive Logs', 
  subtitle = 'Dive Log Management System' 
}: HeaderProps) {
  return (
    <header 
      className="flex items-center px-4 py-2 bg-gray-800 border-b border-gray-700"
      role="banner"
    >
      <img 
        src={`${import.meta.env.BASE_URL}favicon.svg`}
        alt="Dive Logs"
        className="w-7 h-7 mr-2" 
      />
      <h1 className="text-xl font-bold text-white">{title}</h1>
      <div className="flex-1" />
      <span className="text-gray-400 text-sm">{subtitle}</span>
    </header>
  );
}
