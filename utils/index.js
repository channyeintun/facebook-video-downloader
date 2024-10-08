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

export function extractLink(str, regex) {
    const matches = (str + "").match(regex);
    const extractedResult = matches?.length > 0 ? matches[0] : "";
    return solveCors(extractedResult);
}

export function extractVideoLink(str, media) {
    const regex = new RegExp(
        '(?<=FBQualityLabel="' +
        media +
        '">BaseURL>)(.*?)(?=/BaseURL)',
        "s"
    );
    return extractLink(str, regex);
}

export function extractAudioLink(str) {
    const { audioId } = getIds(str);
    const extractedResult = extractUrl(str, audioId);
    return solveCors(extractedResult);
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

export function getIds(resourceStr) {
    const pattern = /"dash_prefetch_experimental":\[\s*"(\d+v)",\s*"(\d+a)"\s*\]/;
    const match = resourceStr.match(pattern);
    if (match) {
        return {
            videoId: match[1],
            audioId: match[2]
        }
    } else {
        throw new Error("No match found");
    }
}

export function extractUrl(fullText, idValue) {
    const start = `id="${idValue}"`;
    const end = "/BaseURL>";
    const startIndex = fullText.indexOf(start);
    let endIndex = fullText.indexOf(end) + end.length;

    while (endIndex !== -1 && endIndex <= startIndex) {
        endIndex = fullText.indexOf("/BaseURL>", endIndex + 1) + end.length;
    }
    console.log({ startIndex, endIndex })

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