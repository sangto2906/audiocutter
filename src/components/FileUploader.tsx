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
    <div className={`upload-card glass-panel ${isDragging ? 'is-dragging' : ''}`} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={() => fileInputRef.current?.click()}>
      <input type="file" className="hidden" ref={fileInputRef} accept="audio/*,.mp3,.wav,.flac,.m4a,.aac,.ogg" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div className="upload-icon"><UploadCloud size={30} strokeWidth={1.8} /></div>
      <p className="eyebrow">Import audio</p>
      <h1>Drop a file to start</h1>
      <p className="upload-copy">or choose an audio file from your computer</p>
      <div className="format-list">{['MP3', 'WAV', 'FLAC', 'M4A'].map((format) => <span key={format}>{format}</span>)}</div>
    </div>
  );
};
