import { useCallback, useEffect, useRef, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import JSZip from 'jszip';
import { useAudioStore } from '../store/useAudioStore';
import { generateFileName } from '../utils/audio';
import type { Chunk } from '../types';

const CORE_CDNS = [
  'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm',
  'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm',
];

const toErrorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);

export const useFFmpeg = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const loadedRef = useRef(false);
  const loadPromiseRef = useRef<Promise<void> | null>(null);
  const inputNameRef = useRef<string | null>(null);
  const inputFileRef = useRef<File | null>(null);
  const { file, outputFormat, metadata } = useAudioStore();

  const createFFmpeg = useCallback(() => {
    const ffmpeg = new FFmpeg();
    ffmpeg.on('progress', ({ progress: value }) => {
      setProgress(Math.max(0, Math.min(100, value * 100)));
    });
    ffmpeg.on('log', ({ message }) => console.debug('[FFmpeg]', message));
    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  }, []);

  const load = useCallback(async () => {
    if (loadedRef.current) return;
    if (loadPromiseRef.current) return loadPromiseRef.current;

    setIsLoading(true);
    setLoadError(null);
    setStatusText('Loading FFmpeg...');

    const promise = (async () => {
      for (const baseURL of CORE_CDNS) {
        try {
          const ffmpeg = createFFmpeg();
          await ffmpeg.load({
            coreURL: await toBlobURL(baseURL + '/ffmpeg-core.js', 'text/javascript'),
            wasmURL: await toBlobURL(baseURL + '/ffmpeg-core.wasm', 'application/wasm'),
          });
          loadedRef.current = true;
          setIsLoaded(true);
          setStatusText('');
          return;
        } catch (error) {
          console.warn('FFmpeg core failed to load from', baseURL, error);
          ffmpegRef.current?.terminate();
          ffmpegRef.current = null;
          loadedRef.current = false;
        }
      }
      throw new Error('Unable to load FFmpeg. Check your connection or disable extensions that block CDN requests.');
    })();

    loadPromiseRef.current = promise;
    try {
      await promise;
    } catch (error) {
      setLoadError(toErrorMessage(error));
      setStatusText('');
    } finally {
      loadPromiseRef.current = null;
      setIsLoading(false);
    }
  }, [createFFmpeg]);

  useEffect(() => {
    void load();
    return () => {
      ffmpegRef.current?.terminate();
      ffmpegRef.current = null;
      loadedRef.current = false;
    };
  }, [load]);

  const restartEngine = useCallback(async () => {
    ffmpegRef.current?.terminate();
    ffmpegRef.current = null;
    loadedRef.current = false;
    inputNameRef.current = null;
    inputFileRef.current = null;
    setIsLoaded(false);
    await load();
  }, [load]);

  const ensureInput = async (ffmpeg: FFmpeg) => {
    if (!file) throw new Error('No audio file selected');
    const extension = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : '.audio';
    const inputName = 'input' + extension.toLowerCase();

    if (inputNameRef.current !== inputName || inputFileRef.current !== file) {
      if (inputNameRef.current) {
        try {
          await ffmpeg.deleteFile(inputNameRef.current);
        } catch {
          // The previous engine may already have been terminated.
        }
      }
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      inputNameRef.current = inputName;
      inputFileRef.current = file;
    }
    return inputName;
  };

  const makeArgs = (inputName: string, chunk: Chunk, outputName: string) => [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-i', inputName,
    '-map', '0:a:0', '-vn', '-sn', '-dn',
    '-ss', chunk.start.toFixed(6),
    '-t', chunk.duration.toFixed(6),
    '-avoid_negative_ts', 'make_zero',
    '-threads', '1',
    ...(outputFormat === 'mp3'
      ? ['-c:a', 'libmp3lame', '-q:a', '2']
      : ['-c:a', 'pcm_s16le']),
    outputName,
  ];

  const readBlob = async (ffmpeg: FFmpeg, outputName: string) => {
    const data = await ffmpeg.readFile(outputName);
    const bytes = (data as Uint8Array).slice();
    return new Blob([bytes.buffer], {
      type: outputFormat === 'mp3' ? 'audio/mpeg' : 'audio/wav',
    });
  };

  const processChunk = async (chunk: Chunk): Promise<Blob> => {
    if (!metadata) throw new Error('No audio metadata');
    await load();
    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg) throw new Error('FFmpeg is not available');

    setIsProcessing(true);
    setProgress(0);
    setStatusText('Processing chunk ' + chunk.index + '...');
    const outputName = 'output_' + chunk.index + '.' + outputFormat;

    try {
      const inputName = await ensureInput(ffmpeg);
      await ffmpeg.exec(makeArgs(inputName, chunk, outputName));
      return await readBlob(ffmpeg, outputName);
    } finally {
      try {
        await ffmpeg.deleteFile(outputName);
      } catch {
        // Best effort cleanup.
      }
      setIsProcessing(false);
      setStatusText('');
    }
  };

  const downloadBlobLocal = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  const processAndDownloadMultiple = async (chunksToProcess: Chunk[], asZip: boolean) => {
    if (!file || !metadata || chunksToProcess.length === 0 || isProcessing) return;

    await load();
    let ffmpeg = ffmpegRef.current;
    if (!ffmpeg) return;

    setIsProcessing(true);
    setProgress(0);
    setStatusText('Preparing...');
    const blobs: { name: string; blob: Blob }[] = [];

    try {
      for (let i = 0; i < chunksToProcess.length; i++) {
        const chunk = chunksToProcess[i];
        if (!chunk) continue;

        setStatusText('Processing chunk ' + chunk.index + ' / ' + chunksToProcess.length);
        setProgress(0);

        const inputName = await ensureInput(ffmpeg);
        const outputName = 'output_' + chunk.index + '.' + outputFormat;

        try {
          await ffmpeg.exec(makeArgs(inputName, chunk, outputName));
          const blob = await readBlob(ffmpeg, outputName);
          blobs.push({
            name: generateFileName(metadata.filename, chunk.index, outputFormat),
            blob,
          });
        } finally {
          try {
            await ffmpeg.deleteFile(outputName);
          } catch {
            // Best effort cleanup.
          }
        }

        // A fresh worker resets the WASM heap before the next chunk.
        if (i < chunksToProcess.length - 1) {
          await restartEngine();
          ffmpeg = ffmpegRef.current;
          if (!ffmpeg) throw new Error('FFmpeg could not be restarted');
        }
      }

      if (asZip) {
        setStatusText('Creating ZIP...');
        const zip = new JSZip();
        for (const item of blobs) zip.file(item.name, item.blob);
        const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
        downloadBlobLocal(zipBlob, generateFileName(metadata.filename, 0, 'zip').replace('_000', ''));
      } else {
        setStatusText('Downloading...');
        for (const [index, item] of blobs.entries()) {
          downloadBlobLocal(item.blob, item.name);
          if (index < blobs.length - 1) {
            await new Promise((resolve) => window.setTimeout(resolve, 350));
          }
        }
      }

      setStatusText('Done!');
      window.setTimeout(() => setStatusText(''), 3000);
    } catch (error) {
      console.error(error);
      setStatusText('Processing failed');
      setLoadError(toErrorMessage(error));
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return {
    isLoaded,
    isLoading,
    isProcessing,
    progress,
    statusText,
    loadError,
    load,
    processChunk,
    processAndDownloadMultiple,
    downloadBlobLocal,
  };
};
