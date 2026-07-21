import { useAudioStore } from './store/useAudioStore';
import { FileUploader } from './components/FileUploader';
import { Waveform } from './components/Waveform';
import { ChunkSettings } from './components/ChunkSettings';
import { ChunkTable } from './components/ChunkTable';
import { formatFileSize, formatTime } from './utils/audio';
import { Scissors, XCircle } from 'lucide-react';

function App() {
  const { file, metadata, reset } = useAudioStore();

  return (
    <div className="min-h-screen flex flex-col p-6">
      
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Scissors size={24} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Audio Chunker</h1>
        </div>
      </header>

      <main className="flex-grow flex flex-col max-w-6xl w-full mx-auto">
        {!file ? (
          <div className="flex-grow flex items-center justify-center">
            <FileUploader />
          </div>
        ) : (
          <div className="flex flex-col animate-fade-in">
            {/* File Info Header */}
            <div className="flex justify-between items-end mb-6 glass-panel rounded-2xl p-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">{metadata?.filename}</h2>
                <div className="flex space-x-6 text-sm font-mono text-gray-400">
                  <span className="flex items-center"><span className="text-daw-primary mr-2">⏱</span>{formatTime(metadata?.duration || 0)}</span>
                  <span className="flex items-center"><span className="text-daw-primary mr-2">🎛</span>{metadata?.sampleRate} Hz</span>
                  <span className="flex items-center"><span className="text-daw-primary mr-2">🔊</span>{metadata?.channels} Ch</span>
                  <span className="flex items-center"><span className="text-daw-primary mr-2">💾</span>{formatFileSize(metadata?.fileSize || 0)}</span>
                </div>
              </div>
              <button 
                onClick={reset}
                className="flex items-center space-x-2 text-sm font-medium text-gray-400 hover:text-red-400 transition-colors px-4 py-2 hover:bg-red-400/10 rounded-lg"
              >
                <XCircle size={18} />
                <span>Close File</span>
              </button>
            </div>

            <Waveform />
            
            <div className="mt-6">
              <ChunkSettings />
              <ChunkTable />
            </div>
          </div>
        )}
      </main>
      
      <footer className="mt-8 text-center text-xs text-gray-500 py-4 border-t border-daw-border">
        Audio Chunker - Runs entirely in your browser using WebAssembly.
      </footer>
    </div>
  );
}

export default App;
