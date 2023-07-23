export function MediaOptions({ resolutions = {}, selectMedia }) {
    return (
        <>
            <div className="options">
                {Object.values(resolutions).some((v) => v) ? (
                    Object.keys(resolutions).map((key) => (
                        <div
                            key={key}
                            className={resolutions[key] ? "resolution" : "hide"}
                        >
                            <input
                                type="radio"
                                name="media"
                                onClick={selectMedia}
                                value={key}
                            />
                            <label>{key}</label>
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
                    min-height: 140px;
                    display: grid;
                    grid-template: auto / repeat(2, 1fr);
                    gap: 5px;
                }
                input[name="media"] {
                    margin-right: 8px;
                }
                .error {
                    color: red;
                    text-align: center;
                    width: 100%;
                }
                .resolution {
                    display: flex;
                    align-items:center;
                    flex-wrap: nowrap;
                    padding-left: 10px;
                }
            `}</style>
        </>
    );
}
