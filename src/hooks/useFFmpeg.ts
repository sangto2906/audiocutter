import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import JSZip from 'jszip';
import { useAudioStore } from '../store/useAudioStore';
import { generateFileName } from '../utils/audio';
import type { Chunk } from '../types';

export const useFFmpeg = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const ffmpegRef = useRef(new FFmpeg());
  
  const { file, outputFormat, metadata } = useAudioStore();

  const load = async () => {
    if (isLoaded) return;
    setStatusText('Loading FFmpeg...');
    const ffmpeg = ffmpegRef.current;
    
    ffmpeg.on('progress', ({ progress }) => {
      // Progress from ffmpeg is between 0 and 1
      setProgress(progress * 100);
    });

    ffmpeg.on('log', ({ message }) => {
      console.log('[FFmpeg]', message);
    });

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    setIsLoaded(true);
    setStatusText('');
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processChunk = async (chunk: Chunk): Promise<Blob> => {
    if (!file || !metadata) throw new Error("No file");
    const ffmpeg = ffmpegRef.current;
    
    setStatusText(`Processing chunk ${chunk.index}...`);
    setProgress(0);
    
    const inputName = 'input' + file.name.substring(file.name.lastIndexOf('.'));
    const outputName = `output_${chunk.index}.${outputFormat}`;
    
    // We can reuse the uploaded file if we write it once, but to be safe we check if it exists
    // actually, we will write it once per batch operation to save time, or here if not exists.
    try {
      await ffmpeg.writeFile(inputName, await fetchFile(file));
    } catch(e) {
      // ignore if already exists or handle
    }

    const start = chunk.start.toString();
    const duration = chunk.duration.toString();

    let args = [
      '-ss', start,
      '-i', inputName,
      '-t', duration,
    ];

    if (outputFormat === 'mp3') {
      args.push('-c:a', 'libmp3lame', '-q:a', '2');
    } else {
      // WAV PCM
      args.push('-c:a', 'pcm_s16le');
    }

    args.push(outputName);

    await ffmpeg.exec(args);

    const data = await ffmpeg.readFile(outputName);
    return new Blob([(data as any).buffer || data], { type: `audio/${outputFormat}` });
  };

  const processAndDownloadMultiple = async (chunksToProcess: Chunk[], asZip: boolean) => {
    if (!file || !metadata || chunksToProcess.length === 0) return;
    setIsProcessing(true);
    setStatusText('Preparing...');
    setProgress(0);
    
    try {
      const ffmpeg = ffmpegRef.current;
      const inputName = 'input' + file.name.substring(file.name.lastIndexOf('.'));
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      
      const blobs: { name: string; blob: Blob }[] = [];

      for (let i = 0; i < chunksToProcess.length; i++) {
        const chunk = chunksToProcess[i];
        setStatusText(`Processing chunk ${chunk.index}/${chunksToProcess.length}`);
        setProgress(0); // Reset for each chunk

        const outputName = `output_${chunk.index}.${outputFormat}`;
        const start = chunk.start.toString();
        const duration = chunk.duration.toString();

        let args = [
          '-ss', start,
          '-i', inputName,
          '-t', duration,
        ];

        if (outputFormat === 'mp3') {
          args.push('-c:a', 'libmp3lame', '-q:a', '2');
        } else {
          args.push('-c:a', 'pcm_s16le');
        }

        args.push(outputName);
        await ffmpeg.exec(args);

        const data = await ffmpeg.readFile(outputName);
        const chunkBlob = new Blob([(data as any).buffer || data], { type: `audio/${outputFormat}` });
        const fileName = generateFileName(metadata.filename, chunk.index, outputFormat);
        blobs.push({ name: fileName, blob: chunkBlob });
        
        // Clean up output file from ffmpeg memory
        await ffmpeg.deleteFile(outputName);
      }
      
      // Clean up input
      await ffmpeg.deleteFile(inputName);

      if (asZip) {
        setStatusText('Creating ZIP...');
        const zip = new JSZip();
        blobs.forEach(b => zip.file(b.name, b.blob));
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        
        const zipName = generateFileName(metadata.filename, 0, 'zip').replace('_000', '');
        downloadBlobLocal(zipBlob, zipName);
      } else {
        setStatusText('Downloading...');
        blobs.forEach(b => downloadBlobLocal(b.blob, b.name));
      }
      
      setStatusText('Done!');
      setTimeout(() => setStatusText(''), 3000);
    } catch (err) {
      console.error(err);
      setStatusText('An error occurred during processing.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadBlobLocal = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    isLoaded,
    isProcessing,
    progress,
    statusText,
    processChunk,
    processAndDownloadMultiple,
  };
};
