import React, { FC, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'src/components/icons';
import { Spinner } from 'src/components/common';

type Props = {
  children: React.ReactNode;
  onClose?: () => void;
  closeable?: boolean;
  loading?: boolean;
};

const Modal: FC<Props> = ({ children, onClose, closeable = true, loading = false }) => {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeable && onClose) {
        onClose();
      }
    },
    [closeable, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  return createPortal(
    <div
      className='
        fixed inset-0
        backdrop-blur-[3px] -webkit-backdrop-blur-[3px]
        flex items-center justify-center
      '
    >
      <div
        className='
          relative flex flex-col items-center
          overflow-y-hidden
          bg-dark-1 backdrop-blur-[100px]
          px-[72px] min-h-[50px]
          min-w-[680px] max-w-[680px]
          rounded-[10px]
          focus:outline-none
        '
      >
        {closeable && onClose && (
          <button onClick={onClose} className='absolute right-5 top-5 cursor-pointer'>
            <X />
          </button>
        )}
        {loading ? <Spinner /> : children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
