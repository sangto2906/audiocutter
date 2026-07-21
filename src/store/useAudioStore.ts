import { create } from 'zustand';
import type { AudioMetadata, Chunk, RemainderOption } from '../types';
import { generateChunks } from '../utils/audio';

interface AudioState {
  file: File | null;
  fileUrl: string | null;
  metadata: AudioMetadata | null;
  
  chunkLength: number;
  offset: number;
  remainderOption: RemainderOption;
  outputFormat: 'mp3' | 'wav';
  
  chunks: Chunk[];
  
  setFile: (file: File | null, metadata: AudioMetadata | null) => void;
  setChunkLength: (length: number) => void;
  setOffset: (offset: number) => void;
  setRemainderOption: (option: RemainderOption) => void;
  setOutputFormat: (format: 'mp3' | 'wav') => void;
  
  recalculateChunks: () => void;
  updateDuration: (duration: number) => void;
  reset: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  file: null,
  fileUrl: null,
  metadata: null,
  
  chunkLength: 30,
  offset: 0,
  remainderOption: 'keep',
  outputFormat: 'mp3',
  
  chunks: [],
  
  setFile: (file, metadata) => {
    const oldUrl = get().fileUrl;
    if (oldUrl) URL.revokeObjectURL(oldUrl);
    
    const fileUrl = file ? URL.createObjectURL(file) : null;
    set({ file, metadata, fileUrl });
    get().recalculateChunks();
  },
  
  setChunkLength: (length) => {
    set({ chunkLength: length });
    get().recalculateChunks();
  },
  
  setOffset: (offset) => {
    set({ offset });
    get().recalculateChunks();
  },
  
  setRemainderOption: (option) => {
    set({ remainderOption: option });
    get().recalculateChunks();
  },

  setOutputFormat: (format) => {
    set({ outputFormat: format });
  },
  
  recalculateChunks: () => {
    const { metadata, chunkLength, offset, remainderOption } = get();
    if (!metadata) {
      set({ chunks: [] });
      return;
    }
    
    const chunks = generateChunks(metadata.duration, chunkLength, offset, remainderOption);
    set({ chunks });
  },

  updateDuration: (duration) => {
    const { metadata } = get();
    if (metadata) {
      set({ metadata: { ...metadata, duration } });
      get().recalculateChunks();
    }
  },
  
  reset: () => {
    const oldUrl = get().fileUrl;
    if (oldUrl) URL.revokeObjectURL(oldUrl);
    
    set({
      file: null,
      fileUrl: null,
      metadata: null,
      chunks: [],
    });
  }
}));
