import { extractThumbnailUrl } from '../utils';

export function MediaOptions({ resolutions = [], selectMedia, resourceStr }) {
    return (
        <>
            <div className="options">
                {resolutions.length > 0 ? (
                    resolutions.map((res) => {
                        let thumbnailUrl = '';
                        try {
                            thumbnailUrl = extractThumbnailUrl(resourceStr);
                        } catch (error) {
                            console.error('Could not extract thumbnail:', error);
                        }
                        
                        return (
                            <div key={res.key} className="resolution-option">
                                <div className="resolution-header">
                                    <input
                                        id={res.key}
                                        type="radio"
                                        name="media"
                                        onChange={selectMedia}
                                        value={res.key}
                                    />
                                    <label htmlFor={res.key}>
                                        {res.qualityLabel} ({res.qualityClass.toUpperCase()})
                                    </label>
                                </div>
                                {thumbnailUrl && (
                                    <img
                                        src={'/api/proxy?url=' + encodeURIComponent(thumbnailUrl)}
                                        className="preview-thumbnail"
                                        alt={`${res.qualityLabel} preview`}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                )}
                            </div>
                        );
                    })
                ) : (
                    <p className="error">Can't find any media!</p>
                )}
            </div>
            <style jsx>{`
                .options {
                    padding: 10px 20px 0;
                    margin-top: 10px;
                    min-width: 0;
                    min-height: 200px;
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 15px;
                    max-height: 400px;
                    overflow-y: auto;
                }
                .resolution-option {
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 10px;
                    background: #f9f9f9;
                }
                .resolution-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 8px;
                }
                input[name="media"] {
                    margin-right: 8px;
                }
                .preview-thumbnail {
                    width: 100%;
                    max-width: 200px;
                    height: auto;
                    border-radius: 4px;
                    object-fit: cover;
                }
                .error {
                    color: red;
                    text-align: center;
                    width: 100%;
                }
            `}</style>
        </>
    );
}