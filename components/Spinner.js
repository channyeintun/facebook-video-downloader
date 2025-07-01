export function Spinner() {
      return (
            <>
                  <div className="spinner-container">
                        <div className="spinner">
                              <div className="spinner-dot"></div>
                              <div className="spinner-dot"></div>
                              <div className="spinner-dot"></div>
                              <div className="spinner-dot"></div>
                        </div>
                  </div>
                  <style jsx>{`
                        .spinner-container {
                              display: flex;
                              align-items: center;
                              justify-content: center;
                        }

                        .spinner {
                              position: relative;
                              width: 40px;
                              height: 10px;
                              display: flex;
                              align-items: center;
                              justify-content: space-between;
                        }

                        .spinner-dot {
                              width: 8px;
                              height: 8px;
                              border-radius: 50%;
                              background: #4f46e5;
                              animation: spinner-bounce 1.4s ease-in-out infinite both;
                        }

                        .spinner-dot:nth-child(1) {
                              animation-delay: -0.32s;
                        }

                        .spinner-dot:nth-child(2) {
                              animation-delay: -0.16s;
                        }

                        .spinner-dot:nth-child(3) {
                              animation-delay: 0s;
                        }

                        .spinner-dot:nth-child(4) {
                              animation-delay: 0.16s;
                        }

                        @keyframes spinner-bounce {
                              0%, 80%, 100% {
                                    transform: scale(0.8);
                                    opacity: 0.5;
                              }
                              40% {
                                    transform: scale(1);
                                    opacity: 1;
                              }
                        }

                        @media (max-width: 480px) {
                              .spinner {
                                    width: 32px;
                                    height: 8px;
                              }

                              .spinner-dot {
                                    width: 6px;
                                    height: 6px;
                              }
                        }
                  `}</style>
            </>
      );
}