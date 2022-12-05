import { FC, useRef } from 'react';
import cn from 'classnames';

import s from './Modal.module.scss';
import { Close } from 'src/components/icons';

interface ModalProps {
  className?: string;
  children: any;
  onClose: () => void;
  onEnter?: () => void | null;
}

const Modal: FC<ModalProps> = ({
  children,
  className = '',
  onClose
}) => {
  const ref = useRef() as React.MutableRefObject<HTMLDivElement>;

  return (
    <div className={cn(s.root)}>
      <div className={cn(s.modal, className)} role='dialog' ref={ref}>
        <Close
          onClick={() => onClose()}
          aria-label='Close panel'
          className={s.close}
        />
        <div className='w-full'>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
