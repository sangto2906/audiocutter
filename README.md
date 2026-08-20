# Audio Chunker

Audio Chunker is a client-side React application for splitting audio files into precise, previewable chunks. Files stay in the browser; FFmpeg WebAssembly handles export locally.

## Development

```bash
npm install
npm run dev
```

Production checks:

```bash
npm run build
npm run lint
```

Supported input formats: MP3, WAV, FLAC, M4A, AAC, and OGG. Exports are MP3 or WAV.
