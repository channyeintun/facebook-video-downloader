
export function NetworkMonitor({chunkSize,contentLength}) {
      return (
            <>
                  <div className="network">
                        <div>{chunkSize}</div>
                        <div>MB / </div>
                        <div>{contentLength}</div>
                        <div>MB</div>
                  </div>
                  <style jsx>{`
                        .network{
                              color:#fca311;
                              width:180px;
                              display:grid;
                              grid-template:30px / repeat(4,1fr);
                              justify-items:start;
                              align-items:center;
                        }
                        `}</style>
            </>
      )
}