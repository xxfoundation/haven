import { FC } from 'react';
import cn from 'classnames';

import { ModalCtaButton, Spinner } from 'src/components/common';
import Modal from 'src/components/common/Modal';

import s from './MuteUser.module.scss';
import { useCallback, useState } from 'react';

export type MuteUserAction = 'mute' | 'mute+delete';

type Props = {
  onConfirm: (action: 'mute' | 'mute+delete') => Promise<void>;
  onCancel: () => void;
}

const MuteUserModal: FC<Props> = ({ onCancel, onConfirm }) =>  {
  const [loading, setLoading]  = useState(false);

  const handleConfirmation = useCallback((action: MuteUserAction) => async () => {
    setLoading(true);
    await onConfirm(action).finally(() => {
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
            <p className='mb-4'>
              Banning a user will mute them and they won't
              be able to send messages anymore unless unbanned.
              However they can still read messages
            </p>
            <p className='mb-4' style={{ color: 'var(--red)', textTransform: 'uppercase' }}>
              ** Important to note that deleting messages cannot be undone. **
            </p>
            <div className={cn('mb-6', s.buttonGroup)}>
              <ModalCtaButton
                buttonCopy='Ban and delete the last message'
                style={{ backgroundColor: 'var(--red)', borderColor: 'var(--red)'  }}
                onClick={handleConfirmation('mute+delete')}
              />
              <ModalCtaButton
                buttonCopy='Just Ban'
                onClick={handleConfirmation('mute')}
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

export default MuteUserModal;
