"use client";
import React from "react";
import { createFFmpeg } from "@ffmpeg/ffmpeg";
import {
    Modal,
    Spinner,
    NetworkMonitor,
    MediaOptions,
    VideoPlayer,
    SaveIcon,
} from "../components/";
import {
    fetchFile,
    Cleaner,
    checkResolutions,
    extractVideoLink,
    extractAudioLink,
} from "../utils";

export default class Home extends React.Component {
    state = {
        contentLength: 0,
        chunkSize: 0,
        videoSrc: "",
        resourceStr: "",
        resolutions: {
            "144p": false,
            "180p": false,
            "240p": false,
            "270p": false,
            "360p": false,
            "480p": false,
            "540p": false,
            "720p": false,
            "1080p": false,
        },
        selectedMedia: "",
        loading: false,
        isLoaded: false,
        isModalVisible: false,
        isSupported: false,
        fileName: "",
        error: "",
        controller: null,
    };

    update = (newObj) => {
        this.setState((prevState) => {
            return {
                ...prevState,
                ...newObj,
            };
        });
    };

    async componentDidMount() {
        if (typeof window !== undefined && !this.ffmpeg) {
            this.ffmpeg = createFFmpeg({
                log: true,
                corePath: new URL("/ffmpeg-core.js", document.location).href,
            });
        }

        if (crossOriginIsolated) {
            console.log("SharedArrayBuffer enabled.");
            if (!this.ffmpeg.isLoaded()) {
                await this.ffmpeg.load().catch((err) => {
                    console.error(err);
                    this.update({ error: err });
                });
                this.ffmpeg.setProgress(({ ratio }) => {
                    console.log("parsing", parseInt(ratio) * 100 + "%");
                });
            }
            this.update({
                isLoaded: true,
                isSupported: true,
            });
        } else {
            this.update({
                isLoaded: true,
            });
        }
    }

    async mergeVideo(video, audio, options) {
        const videoFile = await fetchFile(video, options);
        if (videoFile?.length > 0) {
            this.ffmpeg.FS("writeFile", "video.mp4", videoFile);
        }

        const audioFile = await fetchFile(audio, options);
        if (audioFile?.length > 0) {
            this.ffmpeg.FS("writeFile", "audio.mp4", audioFile);
        }

        if (videoFile?.length === 0 || audioFile?.length === 0) {
            throw new Error("Download has stopped.");
        }

        await this.ffmpeg.run(
            "-i",
            "video.mp4",
            "-i",
            "audio.mp4",
            "-c",
            "copy",
            "output.mp4"
        );
        let data = await this.ffmpeg.FS("readFile", "output.mp4");
        return data;
    }

    async deleteFiles() {
        const files = ["audio.mp4", "video.mp4", "output.mp4"];
        files.forEach((file) => this.deleteFile(file));
    }

    async deleteFile(file) {
        try {
            this.ffmpeg.FS("unlink", file);
            console.log(`Successfully deleted ${file}`);
        } catch (error) {
            console.error(`Error deleting file: ${error}`);
        }
    }

    onChangeInput = (e) => {
        const cleaner = new Cleaner(e.target.value);
        let resourceStr = cleaner.clean(["\\", "amp;", " "]).value;
        this.update({
            resourceStr,
        });
    };

    checkHDhandler = () => {
        const resolutions = checkResolutions(this.state.resourceStr);
        this.update({
            resolutions,
            isModalVisible: true,
        });
    };

    extractLinkHandler = async () => {
        const { resourceStr, selectedMedia } = this.state;
        const controller = new AbortController();
        if (resourceStr && selectedMedia) {
            try {
                this.update({
                    loading: true,
                    isModalVisible: false,
                    error: "",
                    controller,
                });
                const video_link = extractVideoLink(resourceStr, selectedMedia);
                console.log('video_link', video_link);
                if (!video_link) throw new Error("Video link not found.");
                const audio_link = extractAudioLink(resourceStr);
                console.log('audio_link', audio_link);
                if (!audio_link) throw new Error("Audio link not found.");
                const getContentLength = (length) =>
                    this.update({
                        contentLength: length + this.state.contentLength,
                    });
                const progress = ({ value }) =>
                    this.update({
                        chunkSize: this.state.chunkSize + value.byteLength,
                    });

                const handleError = (error) =>
                    this.update({
                        contentLength: 0,
                        chunkSize: 0,
                        loading: false,
                        error: error.message,
                        controller: null,
                    });

                const data = await this.mergeVideo(video_link, audio_link, {
                    getContentLength,
                    progress,
                    handleError,
                    controller,
                });

                if (!this.state.error) {
                    const videoSrc = URL.createObjectURL(
                        new Blob([data.buffer], { type: "video/mp4" })
                    );

                    this.deleteFiles();

                    this.update({
                        videoSrc,
                        loading: false,
                        chunkSize: 0,
                        contentLength: 0,
                    });
                } else {
                    this.update({
                        loading: false,
                        chunkSize: 0,
                        contentLength: 0,
                    });
                }
            } catch (error) {
                console.error(error.message);
                this.update({ error: error.message, loading: false });
            }
        }
    };

    selectMedia = (e) => {
        this.update({
            selectedMedia: e.target.value,
        });
    };
    hideModal = () => {
        this.update({
            isModalVisible: false,
        });
    };

    cleanVideo = () => {
        const videoSrc = this.state.videoSrc;
        this.update({ videoSrc: "", resourceStr: "" });
        URL.revokeObjectURL(videoSrc);
    };

    cancelDownload = () => {
        this.state.controller?.abort();
        this.update({
            chunkSize: 0,
            contentLength: 0,
        });
    };

    render() {
        const contentLengthInMB = (this.state.contentLength / 1048576).toFixed(
            2
        );
        const chunkSizeInMB = (this.state.chunkSize / 1048576).toFixed(2);
        return (
            <>
                <div className="container">
                    {this.state.isSupported ? (
                        <>
                            <h1>Facebook Video Downloader</h1>
                            <textarea
                                value={this.state.resourceStr}
                                className="input-box"
                                placeholder="view-source:video_link, select all codes, copy and paste here"
                                onChange={this.onChangeInput}
                            ></textarea>

                            {this.state.loading ? (
                                <button
                                    onClick={this.cancelDownload}
                                    className="check-button"
                                >
                                    Cancel
                                </button>
                            ) : this.state.videoSrc ? (
                                <button
                                    onClick={this.cleanVideo}
                                    className="check-button"
                                >
                                    Clear
                                </button>
                            ) : (
                                <button
                                    onClick={this.checkHDhandler}
                                    className="check-button"
                                >
                                    Check Media
                                </button>
                            )}

                            <div className="status">
                                <div>{this.state.loading && <Spinner />}</div>
                                <div>
                                    {this.state.loading && (
                                        <NetworkMonitor
                                            contentLength={contentLengthInMB}
                                            chunkSize={chunkSizeInMB}
                                        />
                                    )}
                                </div>
                            </div>
                            {this.state.error && (
                                <div className="error">{this.state.error}</div>
                            )}
                            {this.state.videoSrc && (
                                <div className="save-to-device">
                                    <input
                                        onChange={(e) =>
                                            this.update({
                                                fileName: e.target.value,
                                            })
                                        }
                                        className="file-name"
                                        placeholder="File Name"
                                    />
                                    {this.state.fileName ? (
                                        <a
                                            className="save-button"
                                            href={this.state.videoSrc}
                                            download={this.state.fileName}
                                        >
                                            <SaveIcon />
                                        </a>
                                    ) : (
                                        <a className="save-button">
                                            <SaveIcon />
                                        </a>
                                    )}
                                </div>
                            )}
                            <VideoPlayer videoSrc={this.state.videoSrc} />
                        </>
                    ) : this.state.isLoaded ? (
                        <h1>Your browser is not supported.</h1>
                    ) : (
                        <h2>Loading ...</h2>
                    )}
                </div>
                <Modal visible={this.state.isModalVisible}>
                    <h2 className="modal-title">Select Resolution</h2>
                    <MediaOptions
                        resolutions={this.state.resolutions}
                        selectMedia={this.selectMedia}
                    />
                    <div className="modal-footer">
                        <button onClick={this.hideModal} className="cancel">
                            Cancel
                        </button>
                        <button
                            className={
                                this.state.loading || !this.state.selectedMedia
                                    ? "button disabled"
                                    : "button"
                            }
                            onClick={this.extractLinkHandler}
                            disabled={
                                this.state.loading || !this.state.selectedMedia
                            }
                        >
                            Download
                        </button>
                    </div>
                </Modal>
                <style jsx>{`
                    .container {
                        width: 100vw;
                        min-height: 100vh;
                        padding: 100px 0.5rem 0;
                        display: flex;
                        flex-direction: column;
                        justify-content: flex-start;
                        align-items: center;
                        background: #ffffff;
                        color: white;
                    }

                    .input-box {
                        margin: 10px 0;
                        border: none;
                        outline: none;
                        border-radius: 5px;
                        min-width: 380px;
                        min-height: 120px;
                        color: black;
                        padding: 8px;
                        background: #e8eded;
                    }
                    .check-button {
                        margin: 10px 0;
                        min-width: 380px;
                        min-height: 40px;
                        border: none;
                        outline: none;
                        border-radius: 5px;
                        background: #0a2342;
                        color: white;
                        text-align: center;
                        cursor: pointer;
                    }
                    .check-button:hover,
                    .save-button:hover {
                        filter: brightness(1.5);
                        transition: filter 300ms;
                    }
                    .status {
                        color: #0b0a0a;
                        min-width: 380px;
                        min-height: 0px;
                        box-sizing: border-box;
                        display: grid;
                        grid-template: auto / repeat(2, 1fr);
                        align-items: center;
                        gap: 25px;
                    }
                    .modal-footer {
                        width: 100%;
                        padding: 1rem 0;
                        display: flex;
                        justify-content: space-between;
                        gap: 20px;
                    }
                    .button {
                        min-width: 80px;
                        padding: 10px 25px;
                        border-radius: 5px;
                        color: white;
                        background: #293241;
                        text-align: center;
                        border: none;
                        cursor: pointer;
                    }
                    .cancel {
                        min-width: 80px;
                        padding: 10px 25px;
                        border-radius: 5px;
                        color: #293241;
                        background: transparent;
                        text-align: center;
                        border: 1px solid #293241;
                        cursor: pointer;
                    }
                    .button:hover {
                        filter: brightness(1.3);
                        transition: filter 300ms;
                    }
                    .disabled {
                        filter: brightness(1) !important;
                        background: #8d99ae !important;
                        cursor: not-allowed;
                    }
                    .save-to-device {
                        min-width: 380px;
                        height: 30px;
                        display: flex;
                        justify-content: space-between;
                        gap: 5px;
                        box-sizing: border-box;
                    }
                    .file-name {
                        width: calc(100% - 25px);
                        height: 100%;
                        padding: 0 8px;
                    }
                    .save-button {
                        min-width: 25px;
                        height: 100%;
                        padding: 5px;
                        background: #0a2342;
                        border-radius: 5px;
                        text-decoration: none;
                        color: white;
                        text-align: center;
                        cursor: pointer;
                    }
                    .error {
                        color: red;
                        padding: 8px 4px;
                        text-align: left;
                        width: 380px;
                    }
                    .modal-title {
                        text-align: center;
                    }
                `}</style>

                <style jsx global>{`
                    * {
                        margin: 0;
                        box-sizing: border-box;
                    }
                    h1,
                    h2 {
                        color: #0b0a0a;
                    }
                    .hide {
                        display: none !important;
                    }
                    @media (max-width: 480px) {
                        .check-button,
                        .input-box,
                        .status,
                        .video-player {
                            min-width: 350px;
                        }
                    }
                `}</style>
            </>
        );
    }
}
