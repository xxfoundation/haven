import { FC, useCallback, useState } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import { ModalCtaButton } from 'src/components/common';
import Modal from 'src/components/modals';
import Loading from '../LoadingView';

import s from './MuteUser.module.scss';

export type MuteUserAction = 'mute' | 'mute+delete';

type Props = {
  onConfirm: (action: 'mute' | 'mute+delete') => Promise<void>;
  onCancel: () => void;
}

const MuteUserModal: FC<Props> = ({ onCancel, onConfirm }) =>  {
  const { t } = useTranslation();
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
        {loading ? <Loading /> : (
          <>
            <h2 className={cn('mt-9 mb-4')}>
              {t('Warning')}
            </h2>
            <p className='mb-4'>
              {t(`
                Muting a user will revoke their ability to send messages.
                They will, however, still be able to view messages.
              `)}
            </p>
            <p className='mb-4' style={{ color: 'var(--red)', textTransform: 'uppercase' }}>
              ** {t('Important to note that deleting messages cannot be undone.')} **
            </p>
            <div className={cn('mb-6', s.buttonGroup)}>
              <ModalCtaButton
                buttonCopy={t('Mute and delete the last message')}
                style={{ backgroundColor: 'var(--red)', borderColor: 'var(--red)'  }}
                onClick={handleConfirmation('mute+delete')}
              />
              <ModalCtaButton
                buttonCopy={t('Just Mute')}
                onClick={handleConfirmation('mute')}
              />
              <ModalCtaButton
                style={{ backgroundColor: 'transparent', color: 'var(--orange)', borderColor: 'var(--orange)' }}
                buttonCopy={t('Cancel')}
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
