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
      <div className="container">
        <div className="main-content">
          {isSupported ? (
            <>
              <div className="header">
                <h1>Facebook Video Downloader</h1>
                <p className="subtitle">
                  Download Facebook videos in HD quality with audio
                </p>
                <div className="tech-badge">
                  ✅ Multi-threaded Processing Enabled (SharedArrayBuffer)
                </div>
              </div>

              <div className="input-section">
                <label htmlFor="source-input" className="input-label">
                  Paste Facebook video source code:
                </label>
                <textarea
                  id="source-input"
                  value={resourceStr}
                  className="input-box"
                  placeholder="Go to the Facebook video → Right click → View page source → Select all (Ctrl+A) → Copy → Paste here"
                  onChange={onChangeInput}
                ></textarea>
              </div>

              <div className="action-section">
                {loading ? (
                  <div className="loading-container">
                    <div className="progress-bar-wrapper">
                      <div
                        className="progress-bar"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="progress-text">Processing: {progress}%</p>
                    <button
                      onClick={cancelDownload}
                      className="action-button cancel-button"
                    >
                      Cancel Download
                    </button>
                  </div>
                ) : videoSrc ? (
                  <button
                    onClick={cleanVideo}
                    className="action-button clear-button"
                  >
                    Start New Download
                  </button>
                ) : (
                  <div className="check-section">
                    <button
                      onClick={checkHDhandler}
                      className="action-button primary-button"
                      disabled={!resourceStr.trim()}
                    >
                      Check Available Media
                    </button>
                    <div className="proxy-option">
                      <input
                        id="proxy"
                        checked={proxy}
                        onChange={(e) => setProxy(e.target.checked)}
                        type="checkbox"
                        className="proxy-checkbox"
                      />
                      <label htmlFor="proxy" className="proxy-label">
                        <span>Use Proxy</span>
                        <small>(Enable if download fails)</small>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="error-section">
                  <div className="error-content">
                    <h3>Error</h3>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {videoSrc && (
                <div className="result-section">
                  <div className="download-section">
                    <h3>Download Video</h3>
                    <div className="save-controls">
                      <input
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        className="file-name-input"
                        placeholder="Enter filename (without extension)"
                      />
                      {fileName ? (
                        <a
                          className="download-button"
                          href={videoSrc}
                          download={fileName + '.mp4'}
                        >
                          💾 Download
                        </a>
                      ) : (
                        <button className="download-button disabled">
                          💾 Download
                        </button>
                      )}
                    </div>
                  </div>
                  <VideoPlayer videoSrc={videoSrc} />
                </div>
              )}
            </>
          ) : isLoaded ? (
            <div className="error-section">
              <h1>Browser Not Supported</h1>
              <p>
                Please use a modern browser that supports SharedArrayBuffer.
              </p>
              <p className="tech-note">
                Note: This requires HTTPS and specific security headers.
              </p>
            </div>
          ) : (
            <div className="loading-section">
              <h2>Loading application...</h2>
            </div>
          )}
        </div>
      </div>

      <Modal visible={isModalVisible} onClose={hideModal}>
        <div className="modal-content">
          <h2 className="modal-title">Select Video Quality</h2>
          <p className="modal-subtitle">Choose the quality you want to download</p>
          <MediaOptions
            resolutions={resolutions}
            selectMedia={selectMedia}
            selectedQuality={selectedQuality}
            thumbnail={thumbnail}
          />
          <div className="modal-footer">
            <button onClick={hideModal} className="modal-button secondary">
              Cancel
            </button>
            <button
              className={`modal-button primary ${
                loading || !selectedQuality ? 'disabled' : ''
              }`}
              onClick={extractLinkHandler}
              disabled={loading || !selectedQuality}
            >
              {loading ? 'Processing...' : 'Download Selected'}
            </button>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        .container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem 1rem;
        }

        .main-content {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .header {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          padding: 3rem 2rem;
          text-align: center;
        }

        .header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: white;
        }

        .subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
          margin: 0 0 1rem 0;
        }

        .tech-badge {
          display: inline-block;
          background: rgba(16, 185, 129, 0.2);
          color: #d1fae5;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .input-section {
          padding: 2rem;
        }

        .input-label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }

        .input-box {
          width: 100%;
          min-height: 140px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 1rem;
          font-size: 0.95rem;
          color: #374151;
          background: #f9fafb;
          resize: vertical;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .input-box:focus {
          outline: none;
          border-color: #4f46e5;
          background: white;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .action-section {
          padding: 0 2rem 2rem;
        }

        .check-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .action-button {
          width: 100%;
          padding: 1rem 2rem;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .primary-button {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
        }

        .primary-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3);
        }

        .primary-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .cancel-button {
          background: #ef4444;
          color: white;
        }

        .cancel-button:hover {
          background: #dc2626;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
        }

        .clear-button {
          background: #10b981;
          color: white;
        }

        .clear-button:hover {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        }

        .proxy-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #f3f4f6;
          border-radius: 12px;
        }

        .proxy-checkbox {
          width: 1.25rem;
          height: 1.25rem;
          accent-color: #4f46e5;
        }

        .proxy-label {
          display: flex;
          flex-direction: column;
          color: #374151;
          cursor: pointer;
        }

        .proxy-label small {
          color: #6b7280;
          font-size: 0.85rem;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .progress-bar-wrapper {
          width: 100%;
          height: 12px;
          background: #e5e7eb;
          border-radius: 6px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%);
          transition: width 0.3s ease;
          border-radius: 6px;
        }

        .progress-text {
          text-align: center;
          color: #475569;
          font-weight: 600;
          margin: 0;
        }

        .error-section {
          padding: 2rem;
          background: #fef2f2;
          border-top: 1px solid #fecaca;
        }

        .error-content {
          text-align: center;
          color: #dc2626;
        }

        .error-content h3 {
          margin: 0 0 0.5rem 0;
          color: #dc2626;
        }

        .error-content p {
          margin: 0;
          color: #991b1b;
        }

        .tech-note {
          font-size: 0.9rem;
          margin-top: 0.5rem;
          opacity: 0.8;
        }

        .result-section {
          padding: 2rem;
          background: #f0fdf4;
          border-top: 1px solid #bbf7d0;
        }

        .download-section h3 {
          color: #166534;
          margin: 0 0 1rem 0;
          text-align: center;
        }

        .save-controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .file-name-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 2px solid #d1fae5;
          border-radius: 8px;
          font-size: 1rem;
          color: #374151;
        }

        .file-name-input:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .download-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #10b981;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }

        .download-button:hover:not(.disabled) {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }

        .download-button.disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .loading-section {
          padding: 4rem 2rem;
          text-align: center;
          color: #374151;
        }

        .loading-section h2 {
          margin: 1rem 0 0 0;
          color: #374151;
          font-weight: 500;
        }

        .modal-content {
          min-width: 500px;
          max-width: 90vw;
        }

        .modal-title {
          color: #1f2937;
          text-align: center;
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
        }

        .modal-subtitle {
          color: #6b7280;
          text-align: center;
          margin: 0 0 1.5rem 0;
        }

        .modal-footer {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          justify-content: flex-end;
        }

        .modal-button {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .modal-button.primary {
          background: #4f46e5;
          color: white;
        }

        .modal-button.primary:hover:not(.disabled) {
          background: #4338ca;
          transform: translateY(-1px);
        }

        .modal-button.primary.disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }

        .modal-button.secondary {
          background: transparent;
          color: #374151;
          border: 2px solid #d1d5db;
        }

        .modal-button.secondary:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        @media (max-width: 768px) {
          .container {
            padding: 1rem 0.5rem;
          }

          .header {
            padding: 2rem 1rem;
          }

          .header h1 {
            font-size: 2rem;
          }

          .input-section,
          .action-section,
          .error-section,
          .result-section {
            padding: 1.5rem 1rem;
          }

          .modal-content {
            min-width: auto;
            width: 90vw;
          }

          .save-controls {
            flex-direction: column;
          }

          .modal-footer {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}
