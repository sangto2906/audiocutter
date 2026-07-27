export type RemainderOption = 'keep' | 'discard' | 'merge';

export interface Chunk { index: number; start: number; end: number; duration: number; }

export interface AudioMetadata {
  filename: string;
  duration: number;
  sampleRate?: number;
  channels?: number;
  fileSize: number;
  bitrate?: number;
}
