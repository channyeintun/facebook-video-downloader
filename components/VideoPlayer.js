
export function VideoPlayer({videoSrc}){
      return (
            <>
            {videoSrc?<video 
                        src={videoSrc}
                        className="video-player"
                        controls></video>
            :null}
            <style jsx>{`
                        .video-player{
                              width:380px;
                              border:1px solid black;
                              margin-top:10px;
                        }
            `}</style>
            </>
      )
}