import { useAudioStore } from './store/useAudioStore';
import { FileUploader } from './components/FileUploader';
import { Waveform } from './components/Waveform';
import { ChunkSettings } from './components/ChunkSettings';
import { ChunkTable } from './components/ChunkTable';
import { ZwnjInjector } from './components/ZwnjInjector';
import { formatFileSize, formatTime } from './utils/audio';
import { Scissors, XCircle, Type, AudioLines } from 'lucide-react';
import { useState } from 'react';

function App() {
  const { file, metadata, reset } = useAudioStore();
  const [activeTab, setActiveTab] = useState<'audio' | 'zwnj'>('audio');

  return (
    <div className="min-h-screen flex flex-col p-6">
      
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Scissors size={24} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Audio Chunker</h1>
        </div>
        
        <div className="flex bg-black/20 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setActiveTab('audio')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'audio' ? 'bg-cyan-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <AudioLines size={16} className="mr-2" /> Audio Chunker
          </button>
          <button 
            onClick={() => setActiveTab('zwnj')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'zwnj' ? 'bg-cyan-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Type size={16} className="mr-2" /> ZWNJ Injector
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col max-w-6xl w-full mx-auto">
        {activeTab === 'audio' ? (
          !file ? (
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
                  <span className="flex items-center"><span className="text-daw-primary mr-2">Ã¢ÂÂ±</span>{formatTime(metadata?.duration || 0)}</span>
                  {metadata?.sampleRate && <span className="flex items-center"><span className="text-daw-primary mr-2">Rate</span>{metadata.sampleRate} Hz</span>}
                  {metadata?.channels && <span className="flex items-center"><span className="text-daw-primary mr-2">Audio</span>{metadata.channels} Ch</span>}
                  <span className="flex items-center"><span className="text-daw-primary mr-2">Ã°Å¸â€™Â¾</span>{formatFileSize(metadata?.fileSize || 0)}</span>
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
          )
        ) : (
          <ZwnjInjector />
        )}
      </main>
      
      <footer className="mt-8 text-center text-xs text-gray-500 py-4 border-t border-daw-border">
        Audio Chunker - Runs entirely in your browser using WebAssembly.
      </footer>
    </div>
  );
}

export default App;
