import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

export function Modal({ visible,children }) {
      const [isBrowser, setBrowser] = useState(false);
      useEffect(() => {
            setBrowser(true);
      }, [])
      const modalContent = visible ? (
            <>
                  <div className="overlay">
                        <div className="modal">
                              <div className="modal-body">
                                    {children}
                              </div>
                        </div>
                  </div>
                  <style jsx>{`
                              .overlay{
                                    position:fixed;
                                    top:0;
                                    left:0;
                                    overscroll-behavior: contain;
                                    width:100vw;
                                    height:100vh;
                                    background:rgba(0,0,0,0.4);
                                    z-index:998;
                                    display:flex;
                                    flex-direction:column;
                                    justify-content:center;
                                    align-items:center;
                              }
                              .modal{
                                   min-width:300px;
                                   min-height:300px;
                                   padding:50px;
                                   background:white;
                                   color:black;
                                   border-radius:5px;
                                   display:grid;
                                   grid-template:repeat(2,auto) / 1fr;
                              }
                              .modal-body{
                                    width:100%;
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