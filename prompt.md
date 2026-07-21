Build a production-quality web application called "Audio Chunker".

The application must run entirely in the browser. No backend is allowed.

========================================
GOAL
========================================

The application allows users to upload an audio file and split it into multiple equal-length chunks with sample-accurate cutting.

The resulting chunks can be previewed individually and downloaded either separately or as a ZIP archive.

Accuracy is the highest priority.

========================================
TECH STACK
========================================

- React
- TypeScript
- Vite
- TailwindCSS
- WaveSurfer.js
- ffmpeg.wasm
- JSZip
- Web Workers

Everything must work client-side.

========================================
DESIGN
========================================

Modern DAW-inspired interface.

Dark mode by default.

Responsive.

Large waveform.

Minimal UI.

Smooth animations.

Loading indicators for long operations.

No unnecessary decorations.

========================================
SUPPORTED FILES
========================================

Input:

- mp3
- wav
- flac
- m4a
- aac
- ogg

Output:

- MP3
- WAV

========================================
UPLOAD
========================================

Support:

- Drag & Drop
- Browse button

After loading show:

- filename
- duration
- sample rate
- bitrate (if available)
- channels
- file size

========================================
WAVEFORM
========================================

Use WaveSurfer.js.

Requirements:

- zoom
- horizontal scroll
- play
- pause
- seek
- current time
- duration

The waveform should stay responsive even with long audio files.

========================================
CHUNK SETTINGS
========================================

User specifies:

Chunk length (seconds)

Examples:

5

10

15

30

45

60

90

120

Allow decimals.

Example:

7.5

12.25

========================================
OFFSET
========================================

Optional start offset.

Default:

0

Example:

Offset = 2.3 seconds

Chunks become

2.3-12.3

12.3-22.3

...

========================================
REMAINDER OPTIONS
========================================

Provide three options.

1.

Keep remainder

Example

100 seconds

30 second chunks

Result

30
30
30
10

----------------------------------------

2.

Discard remainder

Result

30
30
30

----------------------------------------

3.

Merge remainder into previous chunk

Example

100 seconds

30 second chunks

Result

30
30
40

========================================
PREVIEW
========================================

After chunk calculation display a table.

Columns

- #
- Start
- End
- Duration
- Preview

Click Preview

Play only that chunk.

Playback automatically stops at chunk end.

========================================
TIMELINE
========================================

Highlight current playing chunk.

Move playhead smoothly.

========================================
PROCESSING
========================================

Use ffmpeg.wasm.

DO NOT use stream copy.

Never use

-c copy

Always decode and re-encode.

Reason:

Sample accurate trimming.

MP3 output:

libmp3lame

Quality:

-q:a 2

WAV output:

PCM

========================================
PROCESSING THREAD
========================================

All FFmpeg work must run inside a Web Worker.

The UI must never freeze.

========================================
PROGRESS
========================================

Show progress for

Loading FFmpeg

Preparing

Processing chunk X/Y

Creating ZIP

Done

Display percentage.

========================================
EXPORT
========================================

Buttons

Download ZIP

Download Selected

Download Individual

========================================
FILE NAMES
========================================

Input

song.mp3

Outputs

song_001.mp3

song_002.mp3

song_003.mp3

Always use zero padding.

========================================
ZIP
========================================

Generate ZIP completely in browser.

No server.

========================================
ERROR HANDLING
========================================

Show friendly errors for

Unsupported format

Corrupted file

FFmpeg loading failure

Memory issues

========================================
PERFORMANCE
========================================

Avoid loading multiple copies of FFmpeg.

Reuse one FFmpeg instance.

Lazy-load FFmpeg.

Process sequentially to reduce memory usage.

Release Blob URLs.

Release AudioBuffers.

Destroy WaveSurfer on unmount.

========================================
CODE STRUCTURE
========================================

Organize code.

Example

/components

/hooks

/workers

/lib

/utils

/types

/pages

========================================
HOOKS
========================================

Examples

useAudioMetadata()

useWaveSurfer()

useChunkGenerator()

useFFmpeg()

useZipExport()

========================================
UTILITIES
========================================

Utilities should include

formatTime()

generateChunks()

formatFileSize()

downloadBlob()

generateFileName()

========================================
ACCESSIBILITY
========================================

Keyboard accessible.

Proper labels.

ARIA where appropriate.

========================================
STATE
========================================

Avoid prop drilling.

Prefer Context or Zustand.

========================================
EDGE CASES
========================================

Correctly handle

Very short files

Very long files

Large MP3s

Fractional chunk lengths

Offset larger than duration

Chunk longer than duration

Empty files

========================================
QUALITY
========================================

TypeScript strict mode.

No any.

Reusable components.

Readable code.

No duplicated logic.

========================================
DO NOT
========================================

Do not use a backend.

Do not upload user files.

Do not require authentication.

Do not use stream copy.

Do not block the UI thread.

========================================
OPTIONAL NICE FEATURES
========================================

Remember previous settings in localStorage.

Drag-and-drop overlay.

Estimated export size.

Cancel processing.

Dark/light theme switch.

========================================
DELIVERABLE
========================================

Produce a complete production-ready project with clean architecture, responsive UI, reusable components, and comments only where necessary.

The application should feel like a professional audio utility similar to desktop audio editors while running entirely in the browser.