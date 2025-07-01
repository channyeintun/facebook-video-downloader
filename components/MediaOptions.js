export function MediaOptions({ resolutions = [], selectMedia, selectedQuality }) {
    console.log('MediaOptions rendered with:', { resolutions: resolutions.length, selectedQuality });
    
    return (
        <>
            <div className="media-options">
                {resolutions.length > 0 ? (
                    resolutions.map((res) => (
                        <div key={res.key} className={`resolution-card ${selectedQuality === res.key ? 'selected' : ''}`}>
                            <div className="card-header">
                                <label className="radio-label" htmlFor={res.key}>
                                    <input
                                        id={res.key}
                                        type="radio"
                                        name="media"
                                        onChange={selectMedia}
                                        value={res.key}
                                        checked={selectedQuality === res.key}
                                        className="radio-input"
                                    />
                                    <span className="radio-custom"></span>
                                    <div className="quality-info">
                                        <span className="quality-label">{res.qualityLabel}</span>
                                        <span className="quality-class">{res.qualityClass.toUpperCase()}</span>
                                    </div>
                                </label>
                            </div>
                            <div className="video-preview">
                                <video
                                    src={'/api/proxy?url=' + encodeURIComponent(res.url)}
                                    className="preview-video"
                                    controls
                                    preload="metadata"
                                    muted
                                    poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e5e7eb'%3E%3Cpath d='M8 5v14l11-7z'/%3E%3C/svg%3E"
                                />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-media">
                        <div className="no-media-icon">📹</div>
                        <h3>No Media Found</h3>
                        <p>Unable to find any video content in the provided source code.</p>
                    </div>
                )}
            </div>
            <style jsx>{`
                .media-options {
                    max-height: 60vh;
                    overflow-y: auto;
                    padding: 0.5rem 0;
                    display: grid;
                    gap: 1rem;
                    min-height: 200px;
                }

                .resolution-card {
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    background: white;
                    position: relative;
                    min-height: fit-content;
                }

                .resolution-card:hover {
                    border-color: #d1d5db;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .resolution-card.selected {
                    border-color: #4f46e5;
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
                }

                .card-header {
                    padding: 1rem;
                    background: #f9fafb;
                    border-bottom: 1px solid #e5e7eb;
                }

                .radio-label {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    font-weight: 500;
                }

                .radio-input {
                    position: absolute;
                    opacity: 0;
                    pointer-events: none;
                }

                .radio-custom {
                    width: 1.25rem;
                    height: 1.25rem;
                    border: 2px solid #d1d5db;
                    border-radius: 50%;
                    position: relative;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                }

                .resolution-card.selected .radio-custom {
                    border-color: #4f46e5;
                    background: #4f46e5;
                }

                .resolution-card.selected .radio-custom::after {
                    content: '';
                    width: 6px;
                    height: 6px;
                    background: white;
                    border-radius: 50%;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }

                .quality-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .quality-label {
                    font-size: 1rem;
                    color: #1f2937;
                    font-weight: 600;
                }

                .quality-class {
                    font-size: 0.875rem;
                    color: #6b7280;
                    font-weight: 500;
                }

                .video-preview {
                    padding: 1rem;
                }

                .preview-video {
                    width: 100%;
                    max-height: 200px;
                    border-radius: 8px;
                    background: #f3f4f6;
                    outline: none;
                }

                .preview-video:focus {
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
                }

                .no-media {
                    text-align: center;
                    padding: 3rem 2rem;
                    color: #6b7280;
                }

                .no-media-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }

                .no-media h3 {
                    color: #374151;
                    margin: 0 0 0.5rem 0;
                    font-size: 1.25rem;
                }

                .no-media p {
                    margin: 0;
                    line-height: 1.5;
                }

                /* Custom scrollbar */
                .media-options::-webkit-scrollbar {
                    width: 6px;
                }

                .media-options::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 3px;
                }

                .media-options::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }

                .media-options::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }

                @media (max-width: 768px) {
                    .card-header {
                        padding: 0.75rem;
                    }

                    .video-preview {
                        padding: 0.75rem;
                    }

                    .preview-video {
                        max-height: 150px;
                    }

                    .radio-label {
                        gap: 0.5rem;
                    }

                    .quality-label {
                        font-size: 0.9rem;
                    }

                    .quality-class {
                        font-size: 0.8rem;
                    }
                }
            `}</style>
        </>
    );
}