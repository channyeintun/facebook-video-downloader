'use client';

import { ReactNode } from 'react';

interface ModalProps {
  visible: boolean;
  children: ReactNode;
  onClose?: () => void;
}

export function Modal({ visible, children, onClose }: ModalProps) {
  if (!visible) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-wrapper" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          backdrop-filter: blur(4px);
          animation: fadeIn 0.2s ease-out;
        }

        .modal-wrapper {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          max-width: 90vw;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .modal-wrapper {
            padding: 1.5rem;
            max-width: 95vw;
          }
        }
      `}</style>
    </>
  );
}
