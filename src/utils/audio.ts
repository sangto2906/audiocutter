import type { Chunk, RemainderOption } from '../types';

export const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00.00';
  const centiseconds = Math.round(seconds * 100);
  const hrs = Math.floor(centiseconds / 360000);
  const mins = Math.floor((centiseconds % 360000) / 6000);
  const secs = Math.floor((centiseconds % 6000) / 100);
  const ms = centiseconds % 100;
  const formattedMins = hrs > 0 ? mins.toString().padStart(2, '0') : mins.toString();
  const formattedSecs = secs.toString().padStart(2, '0');
  const formattedMs = ms.toString().padStart(2, '0');
  return hrs > 0 ? `${hrs}:${formattedMins}:${formattedSecs}.${formattedMs}` : `${formattedMins}:${formattedSecs}.${formattedMs}`;
};

export const formatFileSize = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + (sizes[i] ?? 'Bytes');
};

export const generateFileName = (originalName: string, index: number, extension: string): string => {
  const dot = originalName.lastIndexOf('.');
  const baseName = (dot > 0 ? originalName.slice(0, dot) : originalName).replace(/[\\/:*?"<>|]+/g, '_');
  return `${baseName}_${index.toString().padStart(3, '0')}.${extension}`;
};

export const generateChunks = (duration: number, chunkLength: number, offset: number, remainderOption: RemainderOption): Chunk[] => {
  if (![duration, chunkLength, offset].every(Number.isFinite) || duration <= 0 || chunkLength <= 0) return [];
  const safeOffset = Math.max(0, Math.min(offset, duration));
  if (safeOffset >= duration) return [];
  const roundTime = (value: number) => Math.round(value * 1_000_000) / 1_000_000;
  const chunks: Chunk[] = [];
  let currentStart = safeOffset;
  let index = 1;
  while (currentStart < duration) {
    let currentEnd = roundTime(Math.min(currentStart + chunkLength, duration));
    const currentDuration = roundTime(currentEnd - currentStart);
    if (currentEnd === duration && currentDuration < chunkLength && currentStart > safeOffset) {
      if (remainderOption === 'discard') break;
      if (remainderOption === 'merge' && chunks.length > 0) {
        const previous = chunks[chunks.length - 1];
        previous.end = currentEnd;
        previous.duration = roundTime(previous.end - previous.start);
        break;
      }
    }
    chunks.push({ index, start: roundTime(currentStart), end: currentEnd, duration: currentDuration });
    currentStart = currentEnd;
    index++;
  }
  return chunks;
};
