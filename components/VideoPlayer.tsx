'use client';

interface VideoPlayerProps {
  videoSrc: string;
}

export function VideoPlayer({ videoSrc }: VideoPlayerProps) {
  if (!videoSrc) return null;

  return (
    <div className="w-full">
      <h4 className="text-gray-900 font-medium mb-3 text-sm">Video Preview</h4>
      <div className="relative rounded-lg overflow-hidden bg-black aspect-video shadow-sm border border-gray-200">
        <video
          src={videoSrc}
          className="w-full h-full object-contain"
          controls
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
