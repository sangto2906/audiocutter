import { useAudioStore } from '../store/useAudioStore';
import type { RemainderOption } from '../types';

export const ChunkSettings = () => {
  const { 
    chunkLength, setChunkLength, 
    offset, setOffset, 
    remainderOption, setRemainderOption,
    outputFormat, setOutputFormat 
  } = useAudioStore();

  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setChunkLength(isNaN(val) ? 0 : val);
  };

  const handleOffsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setOffset(isNaN(val) ? 0 : val);
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-6 flex flex-wrap gap-6 mb-6">
      
      {/* Chunk Length */}
      <div className="flex flex-col">
        <label className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Chunk Length (s)</label>
        <input 
          type="number" 
          step="0.1" 
          min="0.1"
          value={chunkLength} 
          onChange={handleLengthChange}
          className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-white w-36 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
        />
      </div>

      {/* Offset */}
      <div className="flex flex-col">
        <label className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Start Offset (s)</label>
        <input 
          type="number" 
          step="0.1"
          min="0"
          value={offset} 
          onChange={handleOffsetChange}
          className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-white w-36 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
        />
      </div>

      {/* Remainder Options */}
      <div className="flex flex-col flex-grow">
        <label className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Remainder Option</label>
        <div className="flex bg-black/40 rounded-xl border border-white/10 overflow-hidden p-1 gap-1">
          {(['keep', 'discard', 'merge'] as RemainderOption[]).map((opt) => (
            <button
              key={opt}
              onClick={() => setRemainderOption(opt)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                remainderOption === opt 
                  ? 'bg-cyan-500 text-white shadow-md' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Output Format */}
      <div className="flex flex-col">
        <label className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Output Format</label>
        <div className="flex bg-black/40 rounded-xl border border-white/10 overflow-hidden p-1 gap-1 w-40">
          {(['mp3', 'wav'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setOutputFormat(fmt)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all uppercase ${
                outputFormat === fmt 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
