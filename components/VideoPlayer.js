export function VideoPlayer({videoSrc}){
      return (
            <>
            {videoSrc ? (
                  <div className="video-player-container">
                        <h4 className="player-title">Preview</h4>
                        <video 
                              src={videoSrc}
                              className="video-player"
                              controls
                              preload="metadata"
                        >
                              Your browser does not support the video tag.
                        </video>
                  </div>
            ) : null}
            <style jsx>{`
                  .video-player-container {
                        width: 100%;
                        text-align: center;
                  }

                  .player-title {
                        color: #166534;
                        margin: 0 0 1rem 0;
                        font-size: 1.1rem;
                        font-weight: 600;
                  }

                  .video-player {
                        width: 100%;
                        max-width: 500px;
                        height: auto;
                        border-radius: 12px;
                        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                        outline: none;
                        background: #000;
                  }

                  .video-player:focus {
                        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15), 0 0 0 3px rgba(16, 185, 129, 0.2);
                  }

                  @media (max-width: 768px) {
                        .video-player {
                              max-width: 100%;
                              border-radius: 8px;
                        }

                        .player-title {
                              font-size: 1rem;
                        }
                  }
            `}</style>
            </>
      )
}