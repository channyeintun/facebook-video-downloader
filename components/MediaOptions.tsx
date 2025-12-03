'use client';

interface Resolution {
  videoId: string;
  qualityClass: string;
  qualityLabel?: string;
  url: string;
  key: string;
}

interface MediaOptionsProps {
  resolutions: Resolution[];
  selectMedia: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedQuality: string;
  thumbnail: string | null;
}

export function MediaOptions({
  resolutions = [],
  selectMedia,
  selectedQuality,
  thumbnail,
}: MediaOptionsProps) {
  return (
    <div className="max-h-[60vh] overflow-y-auto p-1 min-h-[200px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
      {resolutions.length > 0 ? (
        <div className="flex flex-col gap-6">
          {/* Single Thumbnail Preview */}
          <div className="flex justify-center items-center">
            {thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnail}
                alt="Video Preview"
                className="w-full max-w-sm h-auto max-h-56 rounded-lg object-cover bg-gray-100 shadow-sm border border-gray-200"
                loading="lazy"
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full max-w-sm h-48 bg-gray-50 border border-gray-200 rounded-lg text-gray-400">
                <div className="text-3xl mb-2 opacity-50">📹</div>
                <span className="text-sm font-medium">No Preview</span>
              </div>
            )}
          </div>

          {/* Quality Selection Controls */}
          <div className="space-y-3">
            {resolutions.map((res) => (
              <label
                key={res.key}
                className="relative cursor-pointer group block"
                htmlFor={res.key}
              >
                <input
                  id={res.key}
                  type="radio"
                  name="media"
                  onChange={selectMedia}
                  value={res.key}
                  checked={selectedQuality === res.key}
                  className="peer sr-only"
                />
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all peer-checked:border-black peer-checked:ring-1 peer-checked:ring-black peer-checked:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center group-has-[:checked]:border-black group-has-[:checked]:bg-black">
                      <div className="w-2 h-2 rounded-full bg-white opacity-0 group-has-[:checked]:opacity-100"></div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {res.qualityClass.toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {res.qualityClass === 'hd' ? 'High Definition' : 'Standard Definition'}
                      </div>
                    </div>
                  </div>
                  {res.qualityClass === 'hd' && (
                    <span className="px-2 py-1 rounded text-xs font-bold bg-black text-white">HD</span>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 px-4 text-gray-500">
          <div className="text-4xl mb-3 opacity-40">📹</div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Media Found</h3>
          <p className="text-sm">Unable to find any video content.</p>
        </div>
      )}
    </div>
  );
}
