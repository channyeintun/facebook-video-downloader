export const fetchFile = async (_data, options = {}) => {
    // Your existing fetchFile function remains unchanged
    const proxyUrl = '/api/proxy?url=' + encodeURIComponent(_data);
    const { getContentLength, progress, handleError, controller, proxy } = options;
    let data;
    try {
        if (typeof _data !== "string" || !_data) {
            throw new Error("Invalid URL or data is not passed");
        }
        const response = await fetch(proxy ? proxyUrl : _data, controller?.signal ? { signal: controller.signal } : {});
        if (!response.ok) {
            throw new Error(
                `Error ${response.status} - ${response.statusText}`
            );
        }
        if (typeof getContentLength === "function") {
            const length = response.headers.get("Content-Length");
            getContentLength(parseInt(length ?? 0));
        }
        const body = await response.body;
        const rs = consume(body);
        const blob = await new Response(rs).blob();
        data = await blob.arrayBuffer();
    } catch (err) {
        if (typeof handleError === "function") {
            handleError(err);
        } else {
            throw err;
        }
    }

    function consume(rs) {
        const reader = rs.getReader();
        return new ReadableStream({
            async start(controller) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }
                    if (typeof progress === "function") {
                        progress({ done, value });
                    }
                    controller.enqueue(value);
                }
                controller.close();
                reader.releaseLock();
            },
        });
    }
    return new Uint8Array(data);
};

export class Cleaner {
    constructor(raw_text = "") {
        this.value = raw_text;
    }
    clean(trashWords = []) {
        // Handle common JSON-escaped characters
        const escapeMap = {
            "u003C": "<",
            "u003E": ">",
            "u002F": "/",
            "u0026": "&",
            "u00253D": "=",
            "u0025": "%",
            "\\": "",
            "amp;": "&",
        };
        this.value = Object.keys(escapeMap).reduce(
            (text, key) => text.replaceAll(key, escapeMap[key]),
            this.value
        );
        trashWords.forEach((trash) => {
            this.value = this.value.replaceAll(trash, "");
        });
        return this;
    }
}

export function checkResolutions(str) {
    const resolutions = [
        "144p",
        "180p",
        "240p",
        "270p",
        "360p",
        "480p",
        "540p",
        "720p",
        "1080p",
    ];

    return resolutions.reduce((acc, resolution) => {
        acc[resolution] = str.includes(`FBQualityLabel="${resolution}"`);
        return acc;
    }, {});
}

export function solveCors(link) {
    console.log("origin:", link);
    const regex = /(?<=video)(.*?)(?=.fbcdn)/s;
    return link.replace(regex, ".xx");
}

export function getIds(resourceStr) {
    const pattern = /"dash_prefetch_experimental":\[\s*"(\d+v)",\s*"(\d+a)"\s*\]/;
    const match = resourceStr.match(pattern);
    if (match) {
        return {
            videoId: match[1],
            audioId: match[2]
        };
    } else {
        throw new Error("No match found");
    }
}

export function extractVideoLinks(str) {
    const { videoId } = getIds(str);
    console.log("videoId:", videoId);

    // Clean the entire input string
    const cleaner = new Cleaner(str);
    const cleanedStr = cleaner.clean().value;

    // Regex to match Representation blocks
    const representationRegex = /<Representation\s+[^>]*id="(\d+v)"[^>]*FBQualityClass="([^"]+)"[^>]*FBQualityLabel="([^"]+)"[^>]*>[\s\S]*?<BaseURL>(https:\/\/[^<]+)<\/BaseURL>/g;
    const representations = [];
    let match;

    // Collect all representation matches
    while ((match = representationRegex.exec(cleanedStr)) !== null) {
        // Include specific IDs or match the videoId from getIds
        console.log("Match found:", match);
        console.log("Video ID in match:", match[1]);
        if (match[1] === videoId) {
            representations.push({
                videoId: match[1],
                qualityClass: match[2],
                qualityLabel: match[3],
                url: match[4],
            });
        }
    }

    if (representations.length === 0) {
        throw new Error("No video representations found for the specified or target video IDs");
    }

    // Define resolution order for comparison
    const resolutionOrder = ["144p", "180p", "240p", "270p", "360p", "480p", "540p", "720p", "1080p"];

    // Filter and sort for HD (highest resolution, prefer 1080p)
    const hdRepresentations = representations
        .filter((rep) => rep.qualityClass === "hd")
        .sort((a, b) => resolutionOrder.indexOf(b.qualityLabel) - resolutionOrder.indexOf(a.qualityLabel));

    // Filter and sort for SD (lowest resolution, minimum 360p)
    const sdRepresentations = representations
        .filter((rep) => rep.qualityClass === "sd" && resolutionOrder.indexOf(rep.qualityLabel) >= resolutionOrder.indexOf("360p"))
        .sort((a, b) => resolutionOrder.indexOf(a.qualityLabel) - resolutionOrder.indexOf(b.qualityLabel));

    const result = {
        hd: hdRepresentations.length > 0 ? {
            videoId: hdRepresentations[0].videoId,
            qualityClass: hdRepresentations[0].qualityClass,
            qualityLabel: hdRepresentations[0].qualityLabel,
            url: solveCors(hdRepresentations[0].url),
        } : null,
        sd: sdRepresentations.length > 0 ? {
            videoId: sdRepresentations[0].videoId,
            qualityClass: sdRepresentations[0].qualityClass,
            qualityLabel: sdRepresentations[0].qualityLabel,
            url: solveCors(sdRepresentations[0].url),
        } : null,
    };

    if (!result.hd && !result.sd) {
        throw new Error("No valid HD or SD links found for the specified or target video IDs");
    }

    return result;
}

export function extractAudioLink(str) {
    const { audioId } = getIds(str);
    const extractedResult = extractUrl(str, audioId);
    return solveCors(extractedResult);
}

export function extractUrl(fullText, idValue) {
    const start = `id="${idValue}"`;
    const end = "/BaseURL>";
    const startIndex = fullText.indexOf(start);
    let endIndex = fullText.indexOf(end) + end.length;

    while (endIndex !== -1 && endIndex <= startIndex) {
        endIndex = fullText.indexOf("/BaseURL>", endIndex + 1) + end.length;
    }

    if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
        const extractedText = fullText.substring(startIndex, endIndex);
        const urlPattern = /BaseURL>(https:\/\/[^<]+)\/BaseURL>/;
        const match = extractedText.match(urlPattern);

        if (match) {
            return match[1];
        } else {
            throw new Error("No URL found");
        }
    } else {
        throw new Error("Invalid range");
    }
}

export function extractTitle(inputString) {
    const pattern = /"story":\s*{"message":\s*{"text":"([^"]+)",/;
    const match = inputString.match(pattern);

    if (match) {
        return match[1];
    } else {
        return "";
    }
}