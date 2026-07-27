import { useEffect, useRef, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import HoverPlugin from 'wavesurfer.js/dist/plugins/hover.esm.js';
import { useAudioStore } from '../store/useAudioStore';
import { Play, Pause, ZoomIn, ZoomOut } from 'lucide-react';
import { formatTime } from '../utils/audio';

interface WaveformProps {
  onReady?: () => void;
}

export const Waveform = ({ onReady }: WaveformProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  
  const { fileUrl, chunks } = useAudioStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [zoom, setZoom] = useState(10); // pixels per second
  const [isReady, setIsReady] = useState(false);
  const zoomRef = useRef(zoom);
  const onReadyRef = useRef(onReady);

  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { onReadyRef.current = onReady; }, [onReady]);

  // Initialize wavesurfer
  useEffect(() => {
    setIsReady(false);
    if (!containerRef.current || !timelineRef.current || !fileUrl) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#06b6d4', // --color-daw-primary (Cyan)
      progressColor: '#f59e0b', // --color-daw-accent
      cursorColor: '#f59e0b',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 128,
      normalize: true,
      minPxPerSec: zoomRef.current,
      plugins: [
        TimelinePlugin.create({
          container: timelineRef.current,
          height: 20,
          timeInterval: 5,
          primaryLabelInterval: 10,
          style: {
            fontSize: '10px',
            color: '#9ca3af',
          }
        }),
        HoverPlugin.create({
          lineColor: 'rgba(255, 255, 255, 0.5)',
          lineWidth: 2,
          labelBackground: 'rgba(0, 0, 0, 0.75)',
          labelColor: '#fff',
          labelSize: '11px',
        }),
        RegionsPlugin.create()
      ],
    });

    wavesurferRef.current = ws;

    ws.load(fileUrl);

    ws.on('ready', () => {
      const dur = ws.getDuration();
      setDuration(dur);
      useAudioStore.getState().updateDuration(dur);
      setIsReady(true);
      if (onReadyRef.current) onReadyRef.current();
    });

    ws.on('audioprocess', (time) => {
      setCurrentTime(time);
    });
    
    ws.on('seeking', (time) => {
      setCurrentTime(time);
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));

    return () => {
      ws.destroy();
    };
  }, [fileUrl]); // Re-init when fileUrl changes

  // Handle zoom change
  useEffect(() => {
    if (isReady && wavesurferRef.current) {
      try {
        wavesurferRef.current.zoom(zoom);
      } catch (e) {
        console.warn('Zoom failed', e);
      }
    }
  }, [zoom, isReady]);

  // Handle regions for chunks
  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws) return;
    
    const regionsPlugin = ws.getActivePlugins().find(p => p instanceof RegionsPlugin) as RegionsPlugin;
    if (!regionsPlugin) return;

    regionsPlugin.clearRegions();

    // Alternate region colors for visibility
    chunks.forEach((chunk, i) => {
      regionsPlugin.addRegion({
        start: chunk.start,
        end: chunk.end,
        content: `#${chunk.index}`,
        color: i % 2 === 0 ? 'rgba(6, 182, 212, 0.15)' : 'rgba(245, 158, 11, 0.15)',
        drag: false,
        resize: false,
      });
    });
  }, [chunks, fileUrl]);

  const togglePlayPause = useCallback(() => {
    const ws = wavesurferRef.current;
    if (ws) {
      ws.playPause();
    }
  }, []);

  const handleZoomIn = () => setZoom(z => Math.min(z * 1.5, 200));
  const handleZoomOut = () => setZoom(z => Math.max(z / 1.5, 1));

  if (!fileUrl) return null;

  return (
    <div className="w-full glass-panel rounded-2xl p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-3">
          <button
            onClick={togglePlayPause}
            className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-cyan-400 to-cyan-600 text-white rounded-full hover:shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-1" />}
          </button>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-sm font-mono text-gray-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
            <span className="text-white">{formatTime(currentTime)}</span> / {formatTime(duration)}
          </div>
          <div className="flex space-x-2 bg-black/40 p-1 rounded-lg border border-white/5">
            <button onClick={handleZoomOut} className="p-1.5 hover:bg-white/10 rounded-md text-gray-300 transition-colors">
              <ZoomOut size={18} />
            </button>
            <button onClick={handleZoomIn} className="p-1.5 hover:bg-white/10 rounded-md text-gray-300 transition-colors">
              <ZoomIn size={18} />
            </button>
          </div>
        </div>
      </div>
      
      <div ref={timelineRef} className="w-full border-b border-daw-border/50 mb-1" />
      <div ref={containerRef} className="w-full overflow-hidden" />
    </div>
  );
};
