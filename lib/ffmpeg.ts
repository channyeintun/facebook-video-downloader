import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { fetchFile as customFetchFile } from './utils';

let ffmpegInstance: FFmpeg | null = null;
let isLoading = false;

export interface FFmpegProgress {
  ratio: number;
}

export const checkSharedArrayBufferSupport = (): boolean => {
  if (typeof window === 'undefined') return false;

  // Check if SharedArrayBuffer is available
  if (typeof SharedArrayBuffer === 'undefined') {
    return false;
  }

  // Check if crossOriginIsolated is true
  if (!crossOriginIsolated) {
    return false;
  }

  // Additional check for Atomics.waitAsync support
  if (typeof Atomics === 'undefined' || typeof Atomics.waitAsync === 'undefined') {
    return false;
  }

  return true;
};

export const getFFmpegInstance = async (
  onProgress?: (progress: FFmpegProgress) => void
): Promise<FFmpeg> => {
  if (ffmpegInstance && ffmpegInstance.loaded) {
    return ffmpegInstance;
  }

  if (isLoading) {
    // Wait for the current loading to complete
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!isLoading) {
          clearInterval(checkInterval);
          if (ffmpegInstance && ffmpegInstance.loaded) {
            resolve(ffmpegInstance);
          } else {
            reject(new Error('Failed to load FFmpeg'));
          }
        }
      }, 100);
    });
  }

  isLoading = true;

  try {
    const ffmpeg = new FFmpeg();

    // Set progress handler if provided
    if (onProgress) {
      ffmpeg.on('progress', ({ progress }) => {
        onProgress({ ratio: progress });
      });
    }

    // Set log handler for debugging
    ffmpeg.on('log', ({ message }) => {
      console.log('[FFmpeg]', message);
    });

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    const supportsMultiThread = checkSharedArrayBufferSupport();

    if (supportsMultiThread) {
      console.log('✅ SharedArrayBuffer is supported - using multi-threaded version');

      // Use multi-threaded version
      const coreURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/umd';

      await ffmpeg.load({
        coreURL: await toBlobURL(`${coreURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${coreURL}/ffmpeg-core.wasm`, 'application/wasm'),
        workerURL: await toBlobURL(`${coreURL}/ffmpeg-core.worker.js`, 'text/javascript'),
      });
    } else {
      console.log('⚠️ SharedArrayBuffer not supported - using single-threaded version');

      // Use single-threaded version
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
    }

    ffmpegInstance = ffmpeg;
    return ffmpeg;
  } finally {
    isLoading = false;
  }
};

export const mergeVideoAndAudio = async (
  videoUrl: string,
  audioUrl: string,
  options?: {
    onProgress?: (progress: FFmpegProgress) => void;
    proxy?: boolean;
  }
): Promise<Uint8Array> => {
  const { onProgress, proxy } = options || {};
  const ffmpeg = await getFFmpegInstance(onProgress);

  try {
    // Fetch video and audio files using our custom fetchFile with proxy support
    console.log('Fetching video...');
    const videoData = await customFetchFile(videoUrl, { proxy });

    console.log('Fetching audio...');
    const audioData = await customFetchFile(audioUrl, { proxy });

    // Write files to FFmpeg filesystem
    await ffmpeg.writeFile('video.mp4', videoData);
    await ffmpeg.writeFile('audio.mp4', audioData);

    // Merge video and audio
    console.log('Merging video and audio...');
    await ffmpeg.exec([
      '-i', 'video.mp4',
      '-i', 'audio.mp4',
      '-c', 'copy',
      'output.mp4'
    ]);

    // Read the output file
    const data = await ffmpeg.readFile('output.mp4');

    // Clean up
    try {
      await ffmpeg.deleteFile('video.mp4');
      await ffmpeg.deleteFile('audio.mp4');
      await ffmpeg.deleteFile('output.mp4');
    } catch (e) {
      console.warn('Error cleaning up files:', e);
    }

    return data as Uint8Array;
  } catch (error) {
    console.error('Error merging video and audio:', error);
    throw error;
  }
};

export const terminateFFmpeg = () => {
  if (ffmpegInstance) {
    ffmpegInstance.terminate();
    ffmpegInstance = null;
  }
};
