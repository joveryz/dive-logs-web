import { DiveList } from './components/DiveList';
import { DiveDetail } from './components/DiveDetail';
import { ResizablePanels } from './components/ResizablePanels';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Waves } from 'lucide-react';

function App() {
  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col bg-gray-900">
        {/* Header */}
        <header 
          className="flex items-center px-4 py-2 bg-gray-800 border-b border-gray-700"
          role="banner"
        >
          <Waves className="w-6 h-6 text-cyan-400 mr-2" aria-hidden="true" />
          <h1 className="text-xl font-bold text-white">Dive Logs</h1>
          <div className="flex-1" />
          <span className="text-gray-400 text-sm">
            Dive Log Management System
          </span>
        </header>
        
        {/* Main Content - Resizable Panels */}
        <main className="flex-1 overflow-hidden" role="main">
          <ResizablePanels
            direction="horizontal"
            panels={[
              {
                content: (
                  <ErrorBoundary>
                    <DiveList />
                  </ErrorBoundary>
                ),
                minSize: 400,
                defaultSize: 55,
              },
              {
                content: (
                  <ErrorBoundary>
                    <DiveDetail />
                  </ErrorBoundary>
                ),
                minSize: 400,
                defaultSize: 45,
              },
            ]}
          />
        </main>
        
        {/* Footer */}
        <footer 
          className="px-4 py-1.5 bg-gray-800 border-t border-gray-700 text-center"
          role="contentinfo"
        >
          <span className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Dive Logs • Built with React + TypeScript + Recharts
          </span>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
