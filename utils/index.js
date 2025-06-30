export const fetchFile = async (_data, options = {}) => {
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
        console.log("Match found:", match);
        console.log("Video ID in match:", match[1]);
        representations.push({
            videoId: match[1],
            qualityClass: match[2],
            qualityLabel: match[3],
            url: solveCors(match[4]),
        });
    }

    if (representations.length === 0) {
        throw new Error("No video representations found");
    }

    console.log("result:", representations);

    return representations;
}

export function extractAudioLink(str) {
    const { audioId } = getIds(str);
    console.log("audioId:", audioId);

    // Clean the entire input string
    const cleaner = new Cleaner(str);
    const cleanedStr = cleaner.clean().value;

    // Regex to match audio Representation blocks
    const audioRegex = /<Representation\s+[^>]*id="(\d+a)"[^>]*mimeType="audio\/mp4"[^>]*>[\s\S]*?<BaseURL>(https:\/\/[^<]+)<\/BaseURL>/g;
    let match;
    let audioUrl = null;

    // Find the audio representation matching the audioId
    while ((match = audioRegex.exec(cleanedStr)) !== null) {
        if (match[1] === audioId) {
            audioUrl = match[2];
            break;
        }
    }

    if (!audioUrl) {
        throw new Error("No audio representation found for the specified audioId: " + audioId);
    }

    return solveCors(audioUrl);
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