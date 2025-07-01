export function NetworkMonitor({chunkSize, contentLength}) {
      const progress = contentLength > 0 ? (chunkSize / contentLength) * 100 : 0;
      
      return (
            <>
                  <div className="network-monitor">
                        <div className="progress-info">
                              <span className="downloaded">{chunkSize} MB</span>
                              <span className="separator">/</span>
                              <span className="total">{contentLength} MB</span>
                        </div>
                        {contentLength > 0 && (
                              <div className="progress-bar">
                                    <div 
                                          className="progress-fill" 
                                          style={{ width: `${Math.min(progress, 100)}%` }}
                                    ></div>
                              </div>
                        )}
                        <div className="progress-percentage">
                              {contentLength > 0 ? `${Math.round(progress)}%` : 'Calculating...'}
                        </div>
                  </div>
                  <style jsx>{`
                        .network-monitor {
                              display: flex;
                              flex-direction: column;
                              gap: 0.5rem;
                              min-width: 200px;
                        }

                        .progress-info {
                              display: flex;
                              align-items: center;
                              gap: 0.25rem;
                              font-weight: 600;
                        }

                        .downloaded {
                              color: #059669;
                        }

                        .separator {
                              color: #6b7280;
                        }

                        .total {
                              color: #374151;
                        }

                        .progress-bar {
                              width: 100%;
                              height: 6px;
                              background: #e5e7eb;
                              border-radius: 3px;
                              overflow: hidden;
                        }

                        .progress-fill {
                              height: 100%;
                              background: linear-gradient(90deg, #10b981, #059669);
                              border-radius: 3px;
                              transition: width 0.3s ease;
                        }

                        .progress-percentage {
                              font-size: 0.875rem;
                              color: #6b7280;
                              text-align: center;
                              font-weight: 500;
                        }

                        @media (max-width: 480px) {
                              .network-monitor {
                                    min-width: 150px;
                              }

                              .progress-info {
                                    font-size: 0.9rem;
                              }

                              .progress-percentage {
                                    font-size: 0.8rem;
                              }
                        }
                  `}</style>
            </>
      )
}