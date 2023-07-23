export const fetchFile = async (_data, options = {}) => {
    const { getContentLength, progress, handleError } = options;
    let data;
    try {
        if (typeof _data !== "string" || !_data) {
            throw new Error("Invalid URL or data is not passed");
        }
        const response = await fetch(_data);
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
        '">u003CBaseURL>)(.*?)(?=u003C/BaseURL)',
        "s"
    );
    return extractLink(str, regex);
}

export function extractAudioLink(str) {
    const regex = /"mime_type":"audio\/mp4".+?"base_url":"(https?:\/\/[^"]+)"/s;
    const match = (str + "").match(regex);
    const extractedResult = match?.length > 0 ? match[1] : "";
    return solveCors(extractedResult);
}
