import { useState } from 'react';
import { useAudioStore } from '../store/useAudioStore';
import type { RemainderOption } from '../types';

const DECIMAL_INPUT_PATTERN = /^(?:\d+(?:\.\d*)?|\.\d*)$/;

const isDecimalInput = (value: string) => value === '' || DECIMAL_INPUT_PATTERN.test(value);

export const ChunkSettings = () => {
  const { 
    chunkLength, setChunkLength, 
    offset, setOffset, 
    remainderOption, setRemainderOption,
    outputFormat, setOutputFormat 
  } = useAudioStore();

  // Keep the raw text while the user is typing. A controlled numeric value
  // would turn the intermediate value "0." into 0 and remove the dot.
  const [chunkLengthInput, setChunkLengthInput] = useState(String(chunkLength));
  const [offsetInput, setOffsetInput] = useState(String(offset));

  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!isDecimalInput(value)) return;
    setChunkLengthInput(value);

    const val = Number(value);
    if (value !== '' && Number.isFinite(val)) setChunkLength(val);
  };

  const handleOffsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!isDecimalInput(value)) return;
    setOffsetInput(value);

    const val = Number(value);
    if (value !== '' && Number.isFinite(val)) setOffset(val);
  };

  const commitLengthInput = () => {
    const val = Number(chunkLengthInput);
    if (!Number.isFinite(val) || val < 0.1) {
      setChunkLengthInput(String(chunkLength));
      return;
    }
    setChunkLength(val);
    setChunkLengthInput(String(val));
  };

  const commitOffsetInput = () => {
    const val = Number(offsetInput);
    if (!Number.isFinite(val) || val < 0) {
      setOffsetInput(String(offset));
      return;
    }
    setOffset(val);
    setOffsetInput(String(val));
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-6 flex flex-wrap gap-6 mb-6">
      
      {/* Chunk Length */}
      <div className="flex flex-col">
        <label className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Chunk Length (s)</label>
        <input 
          type="text" 
          inputMode="decimal"
          step="0.1" 
          min="0.1"
          value={chunkLengthInput} 
          onChange={handleLengthChange}
          onBlur={commitLengthInput}
          className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-white w-36 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
        />
      </div>

      {/* Offset */}
      <div className="flex flex-col">
        <label className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Start Offset (s)</label>
        <input 
          type="text" 
          inputMode="decimal"
          step="0.1"
          min="0"
          value={offsetInput} 
          onChange={handleOffsetChange}
          onBlur={commitOffsetInput}
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
