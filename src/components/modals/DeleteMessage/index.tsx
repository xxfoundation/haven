import { FC } from 'react';
import cn from 'classnames';

import { ModalCtaButton, Spinner } from 'src/components/common';
import Modal from 'src/components/modals/Modal';

import s from './DeleteMessage.module.scss';
import { useCallback, useState } from 'react';

type Props = {
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

const DeleteMessageModal: FC<Props> = ({ onCancel, onConfirm }) =>  {
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
        {loading ? <div className='my-32'><Spinner /></div> : (
          <>
            <h2 className={cn('mt-9 mb-4')}>Warning</h2>
            <p className='mb-4' style={{ color: 'var(--red)', textTransform: 'uppercase' }}>
              ** Important to note that deleting messages cannot be undone. **
            </p>
            <div className={cn('mb-6', s.buttonGroup)}>
              <ModalCtaButton
                buttonCopy='Delete'
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

export default DeleteMessageModal;
