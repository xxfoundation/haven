import { FC } from 'react';
import cn from 'classnames';

import { ModalCtaButton } from 'src/components/common';
import Modal from 'src/components/modals';

import s from './PinMessage.module.scss';
import { useCallback, useState } from 'react';
import Loading from '../LoadingView';

type Props = {
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

const PinMessageModal: FC<Props> = ({ onCancel, onConfirm }) =>  {
  const [loading, setLoading]  = useState(false);

  const handleConfirmation = useCallback(async () => {
    setLoading(true);
    await onConfirm().finally(() => {
      setLoading(false);
    })
  }, [onConfirm]);

  return (
    <Modal onClose={onCancel}>
      <div
        className={cn('w-full flex flex-col justify-center items-center')}
      >
        {loading ? (<Loading />) : (
          <>
            <h2 className={cn('mt-9 mb-4')}>
              Confirmation
            </h2>
            <p className='mb-4'>
              Pinned messages will remain for around 3 weeks, then it will
              get unpinned again
            </p>
            <div className={cn('mb-6', s.buttonGroup)}>
              <ModalCtaButton
                buttonCopy='Confirm and Pin'
                onClick={handleConfirmation}
              />
              <ModalCtaButton
                style={{ backgroundColor: 'transparent', color: 'var(--orange)', borderColor: 'var(--orange)' }}
                buttonCopy='Cancel'
                onClick={onCancel}
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default PinMessageModal;
