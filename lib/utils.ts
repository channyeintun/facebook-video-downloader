export interface FetchFileOptions {
  getContentLength?: (length: number) => void;
  progress?: (data: { done: boolean; value: Uint8Array }) => void;
  handleError?: (error: Error) => void;
  controller?: AbortController;
  proxy?: boolean;
}

export const fetchFile = async (
  url: string,
  options: FetchFileOptions = {}
): Promise<Uint8Array> => {
  const proxyUrl = '/api/proxy?url=' + encodeURIComponent(url);
  const { getContentLength, progress, handleError, controller, proxy } = options;

  try {
    if (typeof url !== 'string' || !url) {
      throw new Error('Invalid URL or data is not passed');
    }

    const response = await fetch(
      proxy ? proxyUrl : url,
      controller?.signal ? { signal: controller.signal } : {}
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status} - ${response.statusText}`);
    }

    if (typeof getContentLength === 'function') {
      const length = response.headers.get('Content-Length');
      getContentLength(parseInt(length ?? '0'));
    }

    const body = response.body;
    if (!body) {
      throw new Error('Response body is null');
    }

    const rs = consume(body);
    const blob = await new Response(rs).blob();
    const data = await blob.arrayBuffer();

    return new Uint8Array(data);
  } catch (err) {
    if (typeof handleError === 'function') {
      handleError(err as Error);
    }
    throw err;
  }

  function consume(rs: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
    const reader = rs.getReader();
    return new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          if (typeof progress === 'function' && value) {
            progress({ done, value });
          }
          if (value) {
            controller.enqueue(value);
          }
        }
        controller.close();
        reader.releaseLock();
      },
    });
  }
};

export class Cleaner {
  value: string;

  constructor(raw_text = '') {
    this.value = raw_text;
  }

  clean(trashWords: string[] = []): this {
    // Handle common JSON-escaped characters
    const escapeMap: Record<string, string> = {
      u003C: '<',
      u003E: '>',
      u002F: '/',
      u0026: '&',
      u00253D: '=',
      u0025: '%',
      '\\': '',
      'amp;': '&',
    };

    this.value = Object.keys(escapeMap).reduce(
      (text, key) => text.replaceAll(key, escapeMap[key]),
      this.value
    );

    trashWords.forEach((trash) => {
      this.value = this.value.replaceAll(trash, '');
    });

    return this;
  }
}

export function solveCors(link: string): string {
  console.log('origin:', link);
  const regex = /(?<=video)(.*?)(?=.fbcdn)/s;
  return link.replace(regex, '.xx');
}

function extractCompleteJsonObject(str: string, startIndex: number): string | null {
  let braceCount = 0;
  let inString = false;
  let escaped = false;

  for (let i = startIndex; i < str.length; i++) {
    const char = str[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\' && inString) {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          return str.substring(startIndex, i + 1);
        }
      }
    }
  }

  return null;
}

interface ExtractedJson {
  extensions?: {
    all_video_dash_prefetch_representations?: Array<{
      representations: Array<{
        mime_type: string;
        bandwidth: number;
        base_url: string;
      }>;
    }>;
  };
  data?: {
    video?: {
      story?: {
        attachments?: Array<{
          media?: {
            preferred_thumbnail?: {
              image?: {
                uri?: string;
              };
            };
          };
        }>;
      };
    };
  };
}

export function extractJsonFromHtml(htmlStr: string): ExtractedJson {
  // Try to find JSON data in script tags first
  const scriptPattern = /<script[^>]*type=["']application\/json["'][^>]*>([^<]+)<\/script>/g;
  let match;

  while ((match = scriptPattern.exec(htmlStr)) !== null) {
    try {
      const jsonStr = match[1];
      const parsed = JSON.parse(jsonStr);

      // Check if this JSON has the structure we need
      if (
        parsed.extensions &&
        parsed.extensions.all_video_dash_prefetch_representations &&
        parsed.extensions.all_video_dash_prefetch_representations.length > 0
      ) {
        return parsed;
      }

      if (
        parsed.data &&
        parsed.extensions &&
        parsed.extensions.all_video_dash_prefetch_representations &&
        parsed.extensions.all_video_dash_prefetch_representations.length > 0
      ) {
        return parsed;
      }
    } catch {
      // Continue trying other matches
      continue;
    }
  }

  // If no JSON found in script tags, try to extract from the entire HTML
  const extensionsPattern = /"extensions":\s*\{/g;
  let extensionsMatch;

  while ((extensionsMatch = extensionsPattern.exec(htmlStr)) !== null) {
    const startIndex = extensionsMatch.index + extensionsMatch[0].length - 1;
    const completeJson = extractCompleteJsonObject(htmlStr, startIndex);

    if (completeJson) {
      try {
        const extensionsData = JSON.parse(completeJson);
        if (
          extensionsData.all_video_dash_prefetch_representations &&
          extensionsData.all_video_dash_prefetch_representations.length > 0
        ) {
          return { extensions: extensionsData };
        }
      } catch (e) {
        console.error('Failed to parse extensions data:', e);
        continue;
      }
    }
  }

  throw new Error('Could not extract JSON data from HTML');
}

export interface MediaUrl {
  type: 'sd' | 'hd';
  videoUrl: string;
  audioUrl: string | null;
}

export function extractMediaUrls(htmlStr: string): MediaUrl[] {
  const jsonData = extractJsonFromHtml(htmlStr);

  if (
    !jsonData.extensions ||
    !jsonData.extensions.all_video_dash_prefetch_representations ||
    jsonData.extensions.all_video_dash_prefetch_representations.length === 0
  ) {
    throw new Error('No video representations found in the data');
  }

  const representations =
    jsonData.extensions.all_video_dash_prefetch_representations[0].representations;

  if (!representations || representations.length === 0) {
    throw new Error('No representations found');
  }

  // Separate video and audio representations
  const videoReps = representations.filter(
    (rep) => rep.mime_type === 'video/mp4'
  );
  const audioReps = representations.filter(
    (rep) => rep.mime_type === 'audio/mp4'
  );

  if (videoReps.length === 0) {
    throw new Error('No video representations found');
  }

  // Sort video representations by bandwidth
  videoReps.sort((a, b) => a.bandwidth - b.bandwidth);

  // Get SD (lowest bandwidth) and HD (highest bandwidth)
  const sdVideo = videoReps[0];
  const hdVideo = videoReps[videoReps.length - 1];

  // If no audio, set audioUrl to null
  const audioUrl =
    audioReps.length > 0 ? solveCors(audioReps[0].base_url) : null;

  const result: MediaUrl[] = [
    {
      type: 'sd',
      videoUrl: solveCors(sdVideo.base_url),
      audioUrl: audioUrl,
    },
    {
      type: 'hd',
      videoUrl: solveCors(hdVideo.base_url),
      audioUrl: audioUrl,
    },
  ];

  console.log('Extracted media URLs:', result);
  return result;
}

export interface VideoLink {
  videoId: string;
  qualityClass: string;
  qualityLabel?: string;
  url: string;
  key: string;
}

export function extractVideoLinks(str: string): VideoLink[] {
  try {
    // Try new method first
    const mediaUrls = extractMediaUrls(str);
    return mediaUrls.map((media, index) => ({
      videoId: `${media.type}_${index}`,
      qualityClass: media.type,
      qualityLabel: media.type === 'hd' ? 'HD Quality' : 'SD Quality',
      url: media.videoUrl,
      key: `${media.type}_${index}`,
    }));
  } catch (error) {
    console.warn('New extraction method failed:', error);
    throw new Error('Failed to extract video links');
  }
}

export function extractAudioLink(str: string): string | null {
  try {
    const mediaUrls = extractMediaUrls(str);
    if (!mediaUrls[0].audioUrl) return null;
    return mediaUrls[0].audioUrl;
  } catch (error) {
    console.warn('Failed to extract audio link:', error);
    return null;
  }
}

export function extractTitle(inputString: string): string {
  const pattern = /"story":\s*{"message":\s*{"text":"([^"]+)",/;
  const match = inputString.match(pattern);

  if (match) {
    return match[1];
  } else {
    return '';
  }
}

export function extractThumbnail(htmlStr: string): string | null {
  let jsonData: ExtractedJson | Record<string, unknown>;

  try {
    jsonData = JSON.parse(htmlStr);
  } catch {
    jsonData = extractJsonFromHtml(htmlStr);
  }

  // Try to find thumbnail from the data structure
  // Use type assertion since jsonData can be either ExtractedJson or generic object
  const extractedData = jsonData as ExtractedJson;
  if (
    extractedData.data?.video?.story?.attachments &&
    extractedData.data.video.story.attachments.length > 0
  ) {
    const media = extractedData.data.video.story.attachments[0].media;
    const thumbnailUri = media?.preferred_thumbnail?.image?.uri;
    if (thumbnailUri) {
      return thumbnailUri;
    }
  }

  // Fallback: try to find any video thumbnail in the JSON
  const thumbnailPatterns = [
    /preferred_thumbnail[^}]*image[^}]*uri["']\s*:\s*["']([^"']+)["']/,
    /thumbnail[^}]*uri["']\s*:\s*["']([^"']+)["']/,
    /image[^}]*uri["']\s*:\s*["']([^"']+)["']/,
  ];

  const jsonStr = typeof htmlStr === 'string' ? htmlStr : JSON.stringify(jsonData);

  for (const pattern of thumbnailPatterns) {
    const match = jsonStr.match(pattern);
    if (match && match[1]) {
      // Make sure it's a valid image URL
      if (
        match[1].includes('fbcdn.net') &&
        (match[1].includes('.jpg') || match[1].includes('.png'))
      ) {
        return match[1];
      }
    }
  }

  return null;
}
