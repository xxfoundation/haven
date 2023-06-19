import { FC } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import { PrimaryButton, SecondaryButton } from 'src/components/common';
import Modal from 'src/components/modals';

import s from './PinMessage.module.scss';
import { useCallback, useState } from 'react';

type Props = {
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

const PinMessageModal: FC<Props> = ({ onCancel, onConfirm }) =>  {
  const { t } = useTranslation();
  const [loading, setLoading]  = useState(true);

  const handleConfirmation = useCallback(async () => {
    setLoading(true);
    await onConfirm().finally(() => {
      setLoading(false);
    })
  }, [onConfirm]);

  return (
    <Modal loading={loading} onClose={onCancel}>
      <div
        className={cn('w-full flex flex-col justify-center items-center')}
      >
        <h2 className={cn('mt-9 mb-4')}>
          {t('Confirmation')}
        </h2>
        <p className='mb-4'>
          {t(`Pinned messages will remain for around 3 weeks, then it will
          get unpinned again`)}
        </p>
        <div className={cn('mb-6', s.buttonGroup)}>
          <PrimaryButton
            onClick={handleConfirmation}
          >
            {t('Confirm and Pin')}
          </PrimaryButton>
          <SecondaryButton
            onClick={onCancel}
          >
            {t('Cancel')}
          </SecondaryButton>
        </div>
      </div>
    </Modal>
  );
};

export default PinMessageModal;
