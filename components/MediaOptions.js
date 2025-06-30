export function MediaOptions({ resolutions = [], selectMedia }) {
    console.log('resolutions:', resolutions);
    return (
        <>
            <div className="options">
                {resolutions.length > 0 ? (
                    resolutions.map((res) => (
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
                            {res.thumbnail && (
                                <img
                                    src={'/api/proxy?url=' + encodeURIComponent(res.thumbnail)}
                                    className="thumbnail-image"
                                    alt="Video thumbnail"
                                />
                            )}
                        </div>
                    ))
                ) : (
                    <p className="error">Can't find any media!</p>
                )}
            </div>
            <style jsx>{`
                .options {
                    padding: 10px 20px 0;
                    margin-top: 10px;
                    min-width: 0;
                    min-height: 300px;
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
                .preview-video {
                    width: 100%;
                    max-width: 300px;
                    height: 200px;
                    border-radius: 4px;
                }
                .thumbnail-image {
                    width: 100%;
                    max-width: 300px;
                    height: 150px;
                    object-fit: cover;
                    border-radius: 4px;
                    margin-bottom: 8px;
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