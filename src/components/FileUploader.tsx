import { useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { UploadCloud } from 'lucide-react';
import { useAudioStore } from '../store/useAudioStore';

export const FileUploader = () => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setFile } = useAudioStore();
  const handleFile = (file: File) => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|flac|m4a|aac|ogg)$/i)) {
      alert('Unsupported file format. Please upload an audio file.');
      return;
    }
    setFile(file, { filename: file.name, duration: 0, fileSize: file.size });
  };
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  };
  return (
    <div className={`w-full max-w-2xl mx-auto p-16 glass-panel rounded-3xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${isDragging ? 'border-daw-primary bg-daw-primary/5 scale-[1.02] shadow-[0_0_30px_rgba(6,182,212,0.2)]' : 'border-white/10 hover:border-white/20 hover:bg-white/10 hover:scale-[1.01]'}`} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={() => fileInputRef.current?.click()}>
      <input type="file" className="hidden" ref={fileInputRef} accept="audio/*,.mp3,.wav,.flac,.m4a,.aac,.ogg" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div className={`p-5 rounded-2xl mb-6 transition-all duration-300 ${isDragging ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50 scale-110' : 'bg-daw-surface text-daw-primary shadow-xl border border-white/5'}`}><UploadCloud size={56} strokeWidth={1.5} /></div>
      <h2 className="text-3xl font-bold mb-3 tracking-tight">Drag & Drop Audio</h2>
      <p className="text-gray-400 mb-8 font-medium">or click to browse from your computer</p>
      <div className="flex gap-3 text-xs font-mono font-medium text-gray-400">{['MP3', 'WAV', 'FLAC', 'M4A'].map((format) => <span key={format} className="px-3 py-1.5 bg-black/40 rounded-lg border border-white/5">{format}</span>)}</div>
    </div>
  );
};
