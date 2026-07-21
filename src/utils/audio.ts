import type { Chunk, RemainderOption } from '../types';

export const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '00:00.00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);

  const formattedMins = hrs > 0 ? mins.toString().padStart(2, '0') : mins.toString();
  const formattedSecs = secs.toString().padStart(2, '0');
  const formattedMs = ms.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${formattedMins}:${formattedSecs}.${formattedMs}`;
  }
  return `${formattedMins}:${formattedSecs}.${formattedMs}`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const generateFileName = (originalName: string, index: number, extension: string): string => {
  const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
  const paddedIndex = index.toString().padStart(3, '0');
  return `${baseName}_${paddedIndex}.${extension}`;
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const generateChunks = (
  duration: number,
  chunkLength: number,
  offset: number,
  remainderOption: RemainderOption
): Chunk[] => {
  if (duration <= 0 || chunkLength <= 0 || offset >= duration) return [];

  const chunks: Chunk[] = [];
  let currentStart = offset;
  let index = 1;

  while (currentStart < duration) {
    let currentEnd = currentStart + chunkLength;
    if (currentEnd > duration) {
      currentEnd = duration;
    }

    const currentDuration = currentEnd - currentStart;
    
    // Check if this is the last chunk and it's a remainder
    if (currentEnd === duration && currentDuration < chunkLength && currentStart > offset) {
      if (remainderOption === 'discard') {
        break; // Don't add this chunk
      } else if (remainderOption === 'merge' && chunks.length > 0) {
        // Merge into previous chunk
        const prevChunk = chunks[chunks.length - 1];
        prevChunk.end = currentEnd;
        prevChunk.duration = prevChunk.end - prevChunk.start;
        break;
      }
      // 'keep' will just add it normally
    }

    chunks.push({
      index,
      start: currentStart,
      end: currentEnd,
      duration: currentDuration,
    });
    
    currentStart = currentEnd;
    index++;
  }

  return chunks;
};
