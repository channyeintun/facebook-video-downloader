export function MediaOptions({ resolutions = [], selectMedia, selectedQuality, thumbnail }) {
    console.log('MediaOptions rendered with:', { resolutions: resolutions.length, selectedQuality, thumbnail });
    
    return (
        <>
            <div className="media-options">
                {resolutions.length > 0 ? (
                    <div className="media-container">
                        {/* Single Thumbnail Preview */}
                        <div className="thumbnail-section">
                            {thumbnail ? (
                                <img
                                    src={thumbnail}
                                    alt="Video Preview"
                                    className="main-thumbnail"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="no-thumbnail">
                                    <div className="thumbnail-placeholder">📹</div>
                                    <span>No Preview Available</span>
                                </div>
                            )}
                        </div>

                        {/* Quality Selection Controls */}
                        <div className="quality-controls">
                            <h4 className="quality-title">Choose Quality:</h4>
                            <div className="quality-buttons">
                                {resolutions.map((res) => (
                                    <label 
                                        key={res.key} 
                                        className={`quality-option ${selectedQuality === res.key ? 'selected' : ''}`}
                                        htmlFor={res.key}
                                    >
                                        <input
                                            id={res.key}
                                            type="radio"
                                            name="media"
                                            onChange={selectMedia}
                                            value={res.key}
                                            checked={selectedQuality === res.key}
                                            className="quality-input"
                                        />
                                        <div className="quality-button">
                                            <span className="quality-badge">{res.qualityClass.toUpperCase()}</span>
                                            <span className="quality-description">
                                                {res.qualityClass === "hd" ? "High Definition" : "Standard Definition"}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
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
                    padding: 1rem;
                    min-height: 200px;
                }

                .media-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    max-width: 500px;
                    margin: 0 auto;
                }

                .thumbnail-section {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .main-thumbnail {
                    width: 100%;
                    max-width: 400px;
                    max-height: 250px;
                    border-radius: 12px;
                    object-fit: cover;
                    background: #f3f4f6;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                .main-thumbnail:hover {
                    transform: scale(1.02);
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
                }

                .no-thumbnail {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    max-width: 400px;
                    height: 200px;
                    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
                    border: 2px dashed #d1d5db;
                    border-radius: 12px;
                    color: #6b7280;
                }

                .thumbnail-placeholder {
                    font-size: 3rem;
                    margin-bottom: 0.5rem;
                    opacity: 0.6;
                }

                .quality-controls {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e5e7eb;
                }

                .quality-title {
                    margin: 0 0 1rem 0;
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #374151;
                    text-align: center;
                }

                .quality-buttons {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                }

                .quality-option {
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .quality-input {
                    position: absolute;
                    opacity: 0;
                    pointer-events: none;
                }

                .quality-button {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 1rem 1.5rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    background: white;
                    transition: all 0.2s ease;
                    min-width: 120px;
                }

                .quality-option:hover .quality-button {
                    border-color: #d1d5db;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .quality-option.selected .quality-button {
                    border-color: #4f46e5;
                    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.3);
                }

                .quality-badge {
                    font-size: 1rem;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }

                .quality-description {
                    font-size: 0.8rem;
                    font-weight: 500;
                    text-align: center;
                    opacity: 0.8;
                    line-height: 1.2;
                }

                .quality-option.selected .quality-description {
                    opacity: 0.9;
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
                    .media-container {
                        max-width: 100%;
                    }

                    .quality-controls {
                        padding: 1rem;
                    }

                    .quality-buttons {
                        flex-direction: column;
                        gap: 0.75rem;
                    }

                    .quality-button {
                        flex-direction: row;
                        justify-content: space-between;
                        min-width: unset;
                        width: 100%;
                        padding: 0.875rem 1rem;
                    }

                    .quality-description {
                        font-size: 0.75rem;
                    }

                    .main-thumbnail {
                        max-height: 200px;
                    }

                    .no-thumbnail {
                        height: 150px;
                    }

                    .thumbnail-placeholder {
                        font-size: 2.5rem;
                    }
                }

                @media (max-width: 480px) {
                    .media-options {
                        padding: 0.5rem;
                    }

                    .quality-controls {
                        padding: 0.875rem;
                    }

                    .quality-title {
                        font-size: 1rem;
                    }

                    .quality-button {
                        padding: 0.75rem;
                    }

                    .quality-badge {
                        font-size: 0.9rem;
                    }
                }
            `}</style>
        </>
    );
}