import { useState } from 'react';
import { AudioLines, Clock3, FileAudio, HardDrive, Scissors, Type, X } from 'lucide-react';
import { useAudioStore } from './store/useAudioStore';
import { FileUploader } from './components/FileUploader';
import { Waveform } from './components/Waveform';
import { ChunkSettings } from './components/ChunkSettings';
import { ChunkTable } from './components/ChunkTable';
import { ZwnjInjector } from './components/ZwnjInjector';
import { formatFileSize, formatTime } from './utils/audio';

function App() {
  const { file, metadata, reset } = useAudioStore();
  const [activeTab, setActiveTab] = useState<'audio' | 'zwnj'>('audio');
  const homeHref = import.meta.env.BASE_URL;

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href={homeHref} aria-label="Audio Chunker home">
          <span className="brand-mark"><Scissors size={18} strokeWidth={2.2} /></span>
          <span>Audio Chunker</span>
        </a>
        <nav className="mode-switch" aria-label="Tool selection">
          <button className={activeTab === 'audio' ? 'is-active' : ''} onClick={() => setActiveTab('audio')}><AudioLines size={16} /> Audio splitter</button>
          <button className={activeTab === 'zwnj' ? 'is-active' : ''} onClick={() => setActiveTab('zwnj')}><Type size={16} /> ZWNJ tool</button>
        </nav>
      </header>

      <main className="main-content">
        {activeTab === 'audio' ? (
          file && metadata ? (
            <div className="workspace animate-fade-in">
              <div className="file-heading">
                <div className="file-heading-main">
                  <div className="file-icon"><FileAudio size={20} /></div>
                  <div><p className="eyebrow">Source file</p><h1>{metadata.filename}</h1></div>
                </div>
                <button className="quiet-button" onClick={reset}><X size={16} /> Remove file</button>
              </div>
              <div className="metadata-row">
                <span><Clock3 size={14} /> {formatTime(metadata.duration)}</span>
                {metadata.sampleRate && <span>{metadata.sampleRate} Hz</span>}
                {metadata.channels && <span>{metadata.channels} channel{metadata.channels > 1 ? 's' : ''}</span>}
                <span><HardDrive size={14} /> {formatFileSize(metadata.fileSize)}</span>
              </div>
              <Waveform /><ChunkSettings /><ChunkTable />
            </div>
          ) : <FileUploader />
        ) : <ZwnjInjector />}
      </main>
      <footer className="site-footer"><span>Private by design</span><span>Processing happens locally in your browser</span></footer>
    </div>
  );
}

export default App;
