import type { WithChildren } from '@types';
import { FC, HTMLProps, useRef } from 'react';
import cn from 'classnames';

import s from './Modal.module.scss';
import { Close } from 'src/components/icons';

interface ModalProps {
  className?: string;
  onClose: () => void;
  onEnter?: () => void | null;
}

const Modal: FC<WithChildren & ModalProps & HTMLProps<HTMLDivElement>> = ({
  children,
  className = '',
  onClose,
  ...props
}) => {
  const ref = useRef() as React.MutableRefObject<HTMLDivElement>;

  return (
    <div {...props} className={cn(s.root)}>
      <div className={cn('drop-shadow-xl', s.modal, className)} role='dialog' ref={ref}>
        <Close
          onClick={onClose}
          aria-label='Close panel'
          className={s.close}
        />
        <div className='w-full'>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
