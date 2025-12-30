import { DiveList } from './components/DiveList';
import { DiveDetail } from './components/DiveDetail';
import { ResizablePanels } from './components/ResizablePanels';
import { Waves } from 'lucide-react';

function App() {
  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="flex items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
        <Waves className="w-6 h-6 text-cyan-400 mr-2" />
        <h1 className="text-xl font-bold text-white">Online Dive Logs</h1>
        <div className="flex-1" />
        <span className="text-gray-400 text-sm">
          Dive Log Management System
        </span>
      </header>
      
      {/* Main Content - Resizable Panels */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanels
          direction="horizontal"
          panels={[
            {
              content: <DiveList />,
              minSize: 400,
              defaultSize: 55,
            },
            {
              content: <DiveDetail />,
              minSize: 400,
              defaultSize: 45,
            },
          ]}
        />
      </div>
      
      {/* Footer */}
      <footer className="px-4 py-1.5 bg-gray-800 border-t border-gray-700 text-center">
        <span className="text-gray-500 text-xs">
          © 2024 Online Dive Logs • Built with React + TypeScript + Recharts
        </span>
      </footer>
    </div>
  );
}

export default App;
