# Facebook Video Downloader - Multi-threaded Version

A modern Next.js application for downloading Facebook videos in HD quality with audio, featuring multi-threaded FFmpeg processing using SharedArrayBuffer.

## 🚀 Features

- ✅ **Multi-threaded Processing**: Utilizes SharedArrayBuffer and FFmpeg.wasm multi-threaded version for faster video processing
- 🎥 **HD Quality Downloads**: Support for both SD and HD video quality
- 🔊 **Audio Merging**: Automatically merges separate video and audio streams
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Clean, gradient-based interface with smooth animations
- 🔄 **Progress Tracking**: Real-time progress indicators during video processing
- 🌐 **Proxy Support**: Optional proxy for handling CORS issues

## 🛠️ Technology Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **FFmpeg.wasm 0.12.6** (with multi-threading support)
- **eslint-plugin-baseline-js** for JavaScript baseline compatibility

## 📋 Prerequisites

- Node.js 20+
- Modern browser with SharedArrayBuffer support (requires HTTPS in production)
- The following security headers must be configured:
  - `Cross-Origin-Embedder-Policy: require-corp`
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Access-Control-Expose-Headers: Content-Length`

## 🔧 Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Build for Production

```bash
npm run build
npm start
```

## 🧹 Code Quality

### Linting

Run ESLint with baseline compatibility checks:
```bash
npm run lint
```

The project uses `eslint-plugin-baseline-js` to ensure browser compatibility. See [ESLINT_BASELINE.md](./ESLINT_BASELINE.md) for detailed configuration information.

### Type Checking

TypeScript is configured with strict mode for maximum type safety:
```bash
npx tsc --noEmit
```

## 📖 How to Use

1. **Get the Facebook Video Source**:
   - Navigate to a Facebook video
   - Right-click on the page
   - Select "View Page Source" (Ctrl+U or Cmd+Option+U)
   - Select all (Ctrl+A or Cmd+A)
   - Copy the source code

2. **Paste and Process**:
   - Paste the source code into the text area
   - Click "Check Available Media"
   - Select your preferred quality (SD or HD)
   - Click "Download Selected"

3. **Download**:
   - Wait for the video to process
   - Enter a filename
   - Click the download button

## 🔍 SharedArrayBuffer Support

This application automatically detects SharedArrayBuffer support and uses:

- **Multi-threaded FFmpeg** (`@ffmpeg/core-mt`) when SharedArrayBuffer is available
- **Single-threaded FFmpeg** as fallback when SharedArrayBuffer is not supported

### SharedArrayBuffer Requirements:

1. **HTTPS**: Must be served over HTTPS (except localhost)
2. **Security Headers**: The following headers are automatically configured in `next.config.ts`:
   ```typescript
   Cross-Origin-Embedder-Policy: require-corp
   Cross-Origin-Opener-Policy: same-origin
   Access-Control-Expose-Headers: Content-Length
   ```

3. **Browser Support**:
   - Chrome 92+
   - Firefox 89+
   - Safari 15.2+
   - Edge 92+

## 📁 Project Structure

```
fb-video-dl-new-version/
├── app/
│   ├── api/
│   │   └── proxy/
│   │       └── route.ts          # API proxy for CORS handling
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Main video downloader page
│   └── globals.css               # Global styles
├── components/
│   ├── MediaOptions.tsx          # Video quality selector
│   ├── Modal.tsx                 # Modal component
│   └── VideoPlayer.tsx           # Video preview player
├── lib/
│   ├── ffmpeg.ts                 # FFmpeg utilities with multi-threading
│   └── utils.ts                  # Video extraction utilities
├── next.config.ts                # Next.js configuration with headers
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Project dependencies
```

## 🔑 Key Improvements Over Previous Version

1. **Multi-threading**: Up to 4x faster video processing with SharedArrayBuffer
2. **Latest FFmpeg**: Using FFmpeg.wasm 0.12.6 (vs 0.11.0)
3. **TypeScript**: Full type safety throughout the application
4. **Modern Next.js**: App Router (Next.js 16) vs Pages Router (Next.js 13)
5. **Better Error Handling**: Comprehensive error messages and fallbacks
6. **Progress Tracking**: Real-time progress bar during processing
7. **Atomics.waitAsync**: Non-blocking thread synchronization support

## 🐛 Troubleshooting

### SharedArrayBuffer Not Supported

If you see "Browser Not Supported" message:
- Ensure you're using HTTPS (or localhost for development)
- Check browser console for security header errors
- Verify your browser version supports SharedArrayBuffer
- Try clearing browser cache and cookies

### Download Fails

If downloads fail:
- Enable the "Use Proxy" option
- Check browser console for error messages
- Ensure the Facebook video URL is accessible
- Try a different video quality option

### Build Errors

If you encounter build errors:
- Delete `.next` folder: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`
- Rebuild: `npm run build`

## 📝 API Reference

### FFmpeg Utility

```typescript
// Check SharedArrayBuffer support
checkSharedArrayBufferSupport(): boolean

// Merge video and audio
mergeVideoAndAudio(
  videoUrl: string,
  audioUrl: string,
  onProgress?: (progress: FFmpegProgress) => void
): Promise<Uint8Array>
```

### Extraction Utilities

```typescript
// Extract video links
extractVideoLinks(htmlStr: string): VideoLink[]

// Extract audio link
extractAudioLink(htmlStr: string): string | null

// Extract video title
extractTitle(htmlStr: string): string

// Extract thumbnail
extractThumbnail(htmlStr: string): string | null
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is for educational purposes only. Please respect Facebook's Terms of Service.

## 🔗 Resources

- [FFmpeg.wasm Documentation](https://ffmpegwasm.netlify.app/)
- [SharedArrayBuffer MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)
- [Atomics.waitAsync MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics/waitAsync)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Note**: This application processes videos entirely in your browser. No data is sent to any server except for the Facebook video URLs being downloaded.
