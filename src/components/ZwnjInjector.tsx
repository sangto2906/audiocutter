import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export const ZwnjInjector = () => {
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);

  // Inject ZWNJ (\u200C) between every character
  const processText = (text: string) => {
    if (!text) return '';
    return text.split('').join('\u200C');
  };

  const outputText = processText(inputText);

  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in">
      <div className="glass-panel p-8 rounded-3xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">ZWNJ Text Obfuscator</h2>
          <p className="text-gray-400">
            This tool injects Zero-Width Non-Joiner (ZWNJ) characters between every letter of your text. 
            The output looks identical to the original but is technically different, which is useful for bypassing certain text filters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Input Text</label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your text here..."
              className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Output Text</label>
              <button
                onClick={handleCopy}
                disabled={!outputText}
                className="flex items-center text-xs font-medium text-cyan-400 hover:text-cyan-300 disabled:opacity-50 transition-colors"
              >
                {copied ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <textarea
              value={outputText}
              readOnly
              placeholder="Output will appear here..."
              className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-4 text-gray-300 focus:outline-none focus:border-white/20 transition-all resize-none"
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-between items-center bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-xl text-sm text-cyan-200">
          <div>
            <strong>Stats:</strong> Input Length: {inputText.length} chars | Output Length: {outputText.length} chars
          </div>
        </div>
      </div>
    </div>
  );
};
