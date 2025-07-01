import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

export function Modal({ visible, children }) {
      const [isBrowser, setBrowser] = useState(false);
      useEffect(() => {
            setBrowser(true);
      }, [])

      useEffect(() => {
            if (visible) {
                  document.body.style.overflow = 'hidden';
            } else {
                  document.body.style.overflow = 'unset';
            }
            return () => {
                  document.body.style.overflow = 'unset';
            };
      }, [visible]);

      const modalContent = visible ? (
            <>
                  <div className={`overlay ${visible ? 'overlay-enter' : ''}`}>
                        <div className={`modal ${visible ? 'modal-enter' : ''}`}>
                              <div className="modal-body">
                                    {children}
                              </div>
                        </div>
                  </div>
                  <style jsx>{`
                        .overlay {
                              position: fixed;
                              top: 0;
                              left: 0;
                              width: 100vw;
                              height: 100vh;
                              background: rgba(0, 0, 0, 0.75);
                              backdrop-filter: blur(4px);
                              z-index: 1000;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              padding: 1rem;
                              opacity: 0;
                              animation: fadeIn 0.3s ease forwards;
                        }

                        .overlay-enter {
                              opacity: 1;
                        }

                        .modal {
                              background: white;
                              border-radius: 16px;
                              box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
                              max-width: 95vw;
                              max-height: 90vh;
                              overflow: hidden;
                              display: flex;
                              flex-direction: column;
                              transform: scale(0.9) translateY(20px);
                              animation: modalEnter 0.3s ease forwards;
                        }

                        .modal-enter {
                              transform: scale(1) translateY(0);
                        }

                        .modal-body {
                              padding: 2rem;
                              overflow-y: auto;
                              flex: 1;
                        }

                        @keyframes fadeIn {
                              from {
                                    opacity: 0;
                              }
                              to {
                                    opacity: 1;
                              }
                        }

                        @keyframes modalEnter {
                              from {
                                    transform: scale(0.9) translateY(20px);
                                    opacity: 0;
                              }
                              to {
                                    transform: scale(1) translateY(0);
                                    opacity: 1;
                              }
                        }

                        /* Custom scrollbar for modal body */
                        .modal-body::-webkit-scrollbar {
                              width: 6px;
                        }

                        .modal-body::-webkit-scrollbar-track {
                              background: #f1f5f9;
                              border-radius: 3px;
                        }

                        .modal-body::-webkit-scrollbar-thumb {
                              background: #cbd5e1;
                              border-radius: 3px;
                        }

                        .modal-body::-webkit-scrollbar-thumb:hover {
                              background: #94a3b8;
                        }

                        @media (max-width: 768px) {
                              .modal {
                                    margin: 1rem;
                                    max-width: calc(100vw - 2rem);
                                    max-height: calc(100vh - 2rem);
                              }

                              .modal-body {
                                    padding: 1.5rem;
                              }
                        }

                        @media (max-width: 480px) {
                              .overlay {
                                    padding: 0.5rem;
                              }

                              .modal {
                                    margin: 0.5rem;
                                    max-width: calc(100vw - 1rem);
                                    max-height: calc(100vh - 1rem);
                              }

                              .modal-body {
                                    padding: 1rem;
                              }
                        }
                  `}</style>
            </>
      ) : null;

      if (isBrowser) {
            return ReactDOM.createPortal(modalContent, document.getElementById("modal-root"));
      } else {
            return null;
      }
}