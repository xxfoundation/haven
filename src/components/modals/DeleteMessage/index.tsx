import { FC } from 'react';
import cn from 'classnames';

import { useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';

import { ModalCtaButton } from 'src/components/common';
import Modal from 'src/components/modals/Modal';
import { LoadingView } from '..';

import s from './DeleteMessage.module.scss';

type Props = {
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

const DeleteMessageModal: FC<Props> = ({ onCancel, onConfirm }) =>  {
  const { t } = useTranslation();
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
        {loading ? <LoadingView /> : (
          <>
            <h2 className={cn('mt-9 mb-4')}>
              {t('Warning')}
            </h2>
            <p className='mb-4' style={{ color: 'var(--red)', textTransform: 'uppercase' }}>
              ** {t('Important to note that deleting messages cannot be undone.')} **
            </p>
            <div className={cn('mb-6', s.buttonGroup)}>
              <ModalCtaButton
                buttonCopy={t('Delete')}
                onClick={handleConfirmation}
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

export default DeleteMessageModal;
