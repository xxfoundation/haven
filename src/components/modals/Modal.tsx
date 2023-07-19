import type { WithChildren } from '@types';
import { FC, HTMLProps, useRef } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import s from './Modal.module.scss';
import Close from 'src/components/icons/X';
import { useOnClickOutside } from 'usehooks-ts';
import { Spinner } from '@components/common';

type ModalProps = WithChildren & HTMLProps<HTMLDivElement> & {
  closeable?: boolean;
  className?: string;
  loading?: boolean;
  onClose: () => void;
  onEnter?: () => void | null;
}

const Modal: FC<ModalProps> = ({
  children,
  className = '',
  closeable = true,
  loading = false,
  onClose,
  ...props
}) => {
  const { t } = useTranslation();
  const ref = useRef() as React.MutableRefObject<HTMLDivElement>;
  useOnClickOutside(ref, closeable ? onClose : () => {});

  return (
    <div {...props} className={cn(s.root)}>
      <div
        className={cn('drop-shadow-xl rounded-2xl bg-charcoal-4 w-[28rem] p-12 relative', className)}
        role='dialog'
        ref={ref}>
        {closeable && (<Close
          className='w-9 h-9 p-2 absolute right-5 top-5 cursor-pointer hover:text-near-black rounded-full hover:bg-primary'
          onClick={onClose}
          aria-label={t('Close panel')}
        />)}
        <div className='w-full flex flex-col justify-center items-center space-y-8'>
          {loading ? <div className='my-24'><Spinner size='lg'/></div> : children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
