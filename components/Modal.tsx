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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 animate-in zoom-in-95 slide-in-from-bottom-8 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
