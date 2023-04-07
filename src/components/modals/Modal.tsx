import type { WithChildren } from '@types';
import { FC, HTMLProps, useRef } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import s from './Modal.module.scss';
import { Close } from 'src/components/icons';
import { useOnClickOutside } from 'usehooks-ts';

type ModalProps = WithChildren & HTMLProps<HTMLDivElement> & {
  closeable?: boolean;
  className?: string;
  onClose: () => void;
  onEnter?: () => void | null;
}

const Modal: FC<ModalProps> = ({
  children,
  className = '',
  closeable = true,
  onClose,
  ...props
}) => {
  const { t } = useTranslation();
  const ref = useRef() as React.MutableRefObject<HTMLDivElement>;
  useOnClickOutside(ref, closeable ? onClose : () => {});

  return (
    <div {...props} className={cn(s.root)}>
      <div
        className={cn('drop-shadow-xl', s.modal, className)}
        role='dialog'
        ref={ref}>
        {closeable && (<Close
          onClick={onClose}
          aria-label={t('Close panel')}
          className={s.close}
        />)}
        <div className='w-full'>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
