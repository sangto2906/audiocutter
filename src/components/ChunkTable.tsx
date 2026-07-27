import { useState } from 'react';
import { useAudioStore } from '../store/useAudioStore';
import { formatTime } from '../utils/audio';
import { Download, Play, StopCircle } from 'lucide-react';
import { useFFmpeg } from '../hooks/useFFmpeg';

export const ChunkTable = () => {
  const { chunks, fileUrl, outputFormat } = useAudioStore();
  const { isLoaded, isLoading, isProcessing, progress, statusText, loadError, load, processChunk, processAndDownloadMultiple, downloadBlobLocal } = useFFmpeg();
  
  const [playingChunk, setPlayingChunk] = useState<number | null>(null);
  const [selectedChunks, setSelectedChunks] = useState<Set<number>>(new Set());
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  if (chunks.length === 0) return null;

  const toggleSelection = (index: number) => {
    const newSet = new Set(selectedChunks);
    if (newSet.has(index)) newSet.delete(index);
    else newSet.add(index);
    setSelectedChunks(newSet);
  };

  const selectAll = () => {
    if (selectedChunks.size === chunks.length) {
      setSelectedChunks(new Set());
    } else {
      setSelectedChunks(new Set(chunks.map(c => c.index)));
    }
  };

  const handlePreview = (chunkIndex: number, start: number, end: number) => {
    if (playingChunk === chunkIndex) {
      // Stop
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
      setPlayingChunk(null);
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }

    if (fileUrl) {
      const audio = new Audio(fileUrl);
      audio.currentTime = start;
      audio.play();
      setAudioElement(audio);
      setPlayingChunk(chunkIndex);

      const checkEnd = setInterval(() => {
        if (audio.currentTime >= end) {
          audio.pause();
          setPlayingChunk(null);
          clearInterval(checkEnd);
        }
      }, 50);

      audio.onended = () => {
        setPlayingChunk(null);
        clearInterval(checkEnd);
      };
      
      audio.onpause = () => {
        if (audio.currentTime < end) {
          setPlayingChunk(null);
          clearInterval(checkEnd);
        }
      }
    }
  };

  const downloadSingle = async (chunk: typeof chunks[0]) => {
    try {
      const blob = await processChunk(chunk);
      const filename = `output_${chunk.index.toString().padStart(3, '0')}.${outputFormat}`;
      downloadBlobLocal(blob, filename);
    } catch (err) {
      console.error(err);
      alert('Failed to process chunk');
    }
  };

  const downloadSelected = (asZip: boolean) => {
    const toProcess = chunks.filter(c => selectedChunks.has(c.index));
    // Browsers can block multiple programmatic downloads. Always use one ZIP
    // when more than one chunk is selected; a single chunk remains a direct download.
    processAndDownloadMultiple(toProcess, asZip || toProcess.length > 1);
  };

  const downloadAll = (asZip: boolean) => {
    processAndDownloadMultiple(chunks, asZip);
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-6 mt-6 overflow-hidden">
      {loadError && (
        <div className="mb-4 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200" role="alert">
          <strong>Download error:</strong> {loadError}
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold tracking-tight">Generated Chunks <span className="text-cyan-400">({chunks.length})</span></h3>
        
        {isProcessing && (
          <div className="flex items-center text-emerald-400 text-sm font-semibold bg-emerald-400/10 px-4 py-2 rounded-lg border border-emerald-400/20">
            <div className="animate-spin h-4 w-4 border-2 border-emerald-400 border-t-transparent rounded-full mr-3"></div>
            {statusText} {progress > 0 && `(${Math.round(progress)}%)`}
          </div>
        )}
        
        <div className="flex space-x-3">
          {!isLoaded ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400 flex items-center px-4 py-2 bg-black/20 rounded-lg">{isLoading ? 'Loading FFmpeg...' : loadError ? 'FFmpeg unavailable' : 'Preparing FFmpeg...'}</span>
              {!isLoading && <button onClick={() => void load()} className="px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-300">Retry</button>}
            </div>
          ) : (
            <>
              <button 
                className="px-4 py-2 bg-black/40 border border-white/10 hover:border-white/30 hover:bg-white/5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => downloadSelected(false)}
                disabled={selectedChunks.size === 0 || isProcessing}
              >
                {selectedChunks.size > 1 ? 'Download Selected as ZIP' : 'Download Selected'}
              </button>
              <button 
                className="px-4 py-2 bg-black/40 border border-white/10 hover:border-white/30 hover:bg-white/5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => downloadSelected(true)}
                disabled={selectedChunks.size === 0 || isProcessing}
              >
                ZIP Selected
              </button>
              <button 
                className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-cyan-600 text-white font-medium shadow-lg hover:shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 rounded-lg text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => downloadAll(true)}
                disabled={isProcessing}
              >
                <Download size={16} className="mr-2" /> ZIP All
              </button>
            </>
          )}
        </div>
      </div>

      <div className="overflow-x-auto bg-black/20 rounded-xl border border-white/5">
        <table className="w-full text-left text-sm">
          <thead className="text-gray-400 bg-black/40 border-b border-white/10 uppercase tracking-wider text-xs font-semibold">
            <tr>
              <th className="p-4 w-12">
                <input 
                  type="checkbox" 
                  checked={selectedChunks.size === chunks.length && chunks.length > 0} 
                  onChange={selectAll}
                  className="rounded border-gray-600 bg-black/40 focus:ring-cyan-500 accent-cyan-500 w-4 h-4"
                />
              </th>
              <th className="p-4">#</th>
              <th className="p-4">Start</th>
              <th className="p-4">End</th>
              <th className="p-4">Duration</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {chunks.map((chunk) => (
              <tr 
                key={chunk.index} 
                className={`border-b border-white/5 hover:bg-white/5 transition-colors ${playingChunk === chunk.index ? 'bg-cyan-500/10' : ''}`}
              >
                <td className="p-4">
                  <input 
                    type="checkbox"
                    checked={selectedChunks.has(chunk.index)}
                    onChange={() => toggleSelection(chunk.index)}
                    className="rounded border-gray-600 bg-black/40 focus:ring-cyan-500 accent-cyan-500 w-4 h-4"
                  />
                </td>
                <td className="p-4 font-mono text-gray-500 font-medium">{(chunk.index).toString().padStart(2, '0')}</td>
                <td className="p-4 font-mono">{formatTime(chunk.start)}</td>
                <td className="p-4 font-mono">{formatTime(chunk.end)}</td>
                <td className="p-4 font-mono text-emerald-400">{formatTime(chunk.duration)}</td>
                <td className="p-4 flex justify-end space-x-2">
                  <button 
                    onClick={() => handlePreview(chunk.index, chunk.start, chunk.end)}
                    className={`p-2 rounded-lg transition-all ${playingChunk === chunk.index ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 hover:bg-red-400' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}
                    title="Preview"
                  >
                    {playingChunk === chunk.index ? <StopCircle size={18} fill="currentColor" className="text-white" /> : <Play size={18} fill="currentColor" />}
                  </button>
                  <button 
                    onClick={() => downloadSingle(chunk)}
                    disabled={!isLoaded || isProcessing}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    title="Download"
                  >
                    <Download size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
