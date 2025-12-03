'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../components/Modal';
import { MediaOptions } from '../components/MediaOptions';
import { VideoPlayer } from '../components/VideoPlayer';
import {
  checkSharedArrayBufferSupport,
  mergeVideoAndAudio,
  FFmpegProgress,
} from '../lib/ffmpeg';
import {
  Cleaner,
  extractVideoLinks,
  extractAudioLink,
  extractTitle,
  extractThumbnail,
  fetchFile,
  VideoLink,
} from '../lib/utils';

export default function Home() {
  const [resourceStr, setResourceStr] = useState('');
  const [resolutions, setResolutions] = useState<VideoLink[]>([]);
  const [selectedQuality, setSelectedQuality] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [videoSrc, setVideoSrc] = useState('');
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [proxy, setProxy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [controller, setController] = useState<AbortController | null>(null);

  useEffect(() => {
    const checkSupport = () => {
      const supported = checkSharedArrayBufferSupport();
      setIsSupported(supported);
      setIsLoaded(true);
    };

    checkSupport();
  }, []);

  const onChangeInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const cleaner = new Cleaner(e.target.value);
    const cleanedStr = cleaner.clean(['u003C', '\\', 'amp;']).value;

    const title = extractTitle(cleanedStr);
    setResourceStr(cleanedStr);
    setFileName(title);
    setResolutions([]);
    setSelectedQuality('');
  };

  const checkHDhandler = () => {
    try {
      const links = extractVideoLinks(resourceStr);
      const thumb = extractThumbnail(resourceStr);

      const resolutionsList = links.map((item, index) => ({
        videoId: item.videoId,
        qualityClass: item.qualityClass,
        qualityLabel:
          item.qualityLabel ||
          (item.qualityClass === 'hd' ? 'HD Quality' : 'SD Quality'),
        url: item.url,
        key: item.key || `${item.qualityClass}_${index}`,
      }));

      setResolutions(resolutionsList);
      setThumbnail(thumb);
      setIsModalVisible(true);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract video links');
      setIsModalVisible(false);
    }
  };

  const extractLinkHandler = async () => {
    if (!resourceStr || !selectedQuality) return;

    const abortController = new AbortController();
    setController(abortController);

    try {
      setLoading(true);
      setIsModalVisible(false);
      setError('');
      setProgress(0);

      // Find the selected resolution
      const selectedResolution = resolutions.find(
        (res) => res.key === selectedQuality
      );

      if (!selectedResolution) {
        setError('Selected resolution not found.');
        setLoading(false);
        return;
      }

      const videoLink = selectedResolution.url;
      console.log('video_link', videoLink);

      if (!videoLink) {
        setError('Video link not found.');
        setLoading(false);
        return;
      }

      let audioLink: string | null = null;
      try {
        audioLink = extractAudioLink(resourceStr);
      } catch {
        audioLink = null;
      }
      console.log('audio_link', audioLink);

      let fileData: Uint8Array;

      if (audioLink && isSupported) {
        // Use FFmpeg to merge video and audio (multi-threaded if supported)
        fileData = await mergeVideoAndAudio(videoLink, audioLink, {
          onProgress: (prog: FFmpegProgress) => {
            setProgress(Math.round(prog.ratio * 100));
          },
          proxy,
        });
      } else {
        // Only download video, no merging
        fileData = await fetchFile(videoLink, {
          controller: abortController,
          proxy,
        });
      }

      // Create a blob and set videoSrc
      // Convert to regular ArrayBuffer to avoid SharedArrayBuffer type issues
      const regularBuffer = new Uint8Array(fileData);
      const blob = new Blob([regularBuffer], { type: 'video/mp4' });
      const videoUrl = URL.createObjectURL(blob);
      setVideoSrc(videoUrl);
      setLoading(false);
      setProgress(0);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Download cancelled');
      } else {
        setError(err instanceof Error ? err.message : 'Download failed');
      }
      setLoading(false);
      setProgress(0);
    } finally {
      setController(null);
    }
  };

  const selectMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedQuality(e.target.value);
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const cleanVideo = () => {
    if (videoSrc) {
      URL.revokeObjectURL(videoSrc);
    }
    setVideoSrc('');
    setResourceStr('');
    setResolutions([]);
    setSelectedQuality('');
  };

  const cancelDownload = () => {
    controller?.abort();
    setLoading(false);
    setProgress(0);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-gray-900 selection:text-white">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">
              Facebook Video Downloader
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Download high-quality videos directly from Facebook. Fast, secure, and free.
            </p>
            {isSupported && (
              <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Multi-threaded Processing Active
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {isSupported ? (
              <div className="p-8 sm:p-10 space-y-8">
                <div className="space-y-4">
                  <label htmlFor="source-input" className="block text-sm font-medium text-gray-700">
                    Source Code
                  </label>
                  <div className="relative">
                    <textarea
                      id="source-input"
                      value={resourceStr}
                      className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm min-h-[160px] p-4 bg-gray-50 focus:bg-white transition-colors resize-y font-mono text-gray-600"
                      placeholder="Paste the Facebook video source code here..."
                      onChange={onChangeInput}
                    ></textarea>
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400 font-medium">
                      {resourceStr.length > 0 ? `${resourceStr.length} chars` : ''}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Right-click video page &rarr; View Page Source &rarr; Select All &rarr; Copy
                  </p>
                </div>

                <div className="space-y-6">
                  {loading ? (
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 space-y-4">
                      <div className="flex justify-between items-center text-sm font-medium text-gray-900">
                        <span>Processing...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black transition-all duration-300 ease-out rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <button
                        onClick={cancelDownload}
                        className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : videoSrc ? (
                    <button
                      onClick={cleanVideo}
                      className="w-full py-4 px-6 rounded-xl font-semibold text-white bg-black hover:bg-gray-800 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Download Another Video
                    </button>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <button
                        onClick={checkHDhandler}
                        className="w-full py-4 px-6 rounded-xl font-semibold text-white bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
                        disabled={!resourceStr.trim()}
                      >
                        Check Available Quality
                      </button>

                      <div className="flex items-center gap-3">
                        <input
                          id="proxy"
                          checked={proxy}
                          onChange={(e) => setProxy(e.target.checked)}
                          type="checkbox"
                          className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black cursor-pointer"
                        />
                        <label htmlFor="proxy" className="text-sm text-gray-600 cursor-pointer select-none">
                          Use Proxy <span className="text-gray-400">(Enable if download fails)</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <p className="text-sm text-red-600 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {videoSrc && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="mb-6 flex flex-col sm:flex-row gap-4 items-end">
                      <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filename</label>
                        <input
                          value={fileName}
                          onChange={(e) => setFileName(e.target.value)}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2.5"
                          placeholder="video-filename"
                        />
                      </div>
                      {fileName ? (
                        <a
                          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                          href={videoSrc}
                          download={fileName + '.mp4'}
                        >
                          Save MP4
                        </a>
                      ) : (
                        <button className="w-full sm:w-auto px-6 py-2.5 bg-gray-300 text-gray-500 font-medium rounded-lg cursor-not-allowed">
                          Save MP4
                        </button>
                      )}
                    </div>
                    <VideoPlayer videoSrc={videoSrc} />
                  </div>
                )}
              </div>
            ) : isLoaded ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Browser Not Supported</h3>
                <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                  Please use a modern browser like Chrome, Edge, or Firefox that supports SharedArrayBuffer.
                </p>
              </div>
            ) : (
              <div className="p-12 flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500">Loading...</p>
              </div>
            )}
          </div>

          <div className="mt-12 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Facebook Video Downloader. All rights reserved.
          </div>
        </div>
      </div>

      <Modal visible={isModalVisible} onClose={hideModal}>
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Select Quality</h2>
            <p className="text-sm text-gray-500 mt-1">Choose your preferred video resolution</p>
          </div>

          <MediaOptions
            resolutions={resolutions}
            selectMedia={selectMedia}
            selectedQuality={selectedQuality}
            thumbnail={thumbnail}
          />

          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={hideModal}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-white shadow-sm transition-all ${loading || !selectedQuality
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-black hover:bg-gray-800'
                }`}
              onClick={extractLinkHandler}
              disabled={loading || !selectedQuality}
            >
              Download
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
