import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from 'src/components/common';
import Modal from 'src/components/modals';

import { useCallback, useState } from 'react';
import ModalTitle from '../ModalTitle';

type Props = {
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

const PinMessageModal: FC<Props> = ({ onCancel, onConfirm }) =>  {
  const { t } = useTranslation();
  const [loading, setLoading]  = useState(false);

  const handleConfirmation = useCallback(async () => {
    setLoading(true);
    await onConfirm().finally(() => {
      setLoading(false);
    })
  }, [onConfirm]);

  return (
    <Modal loading={loading} onClose={onCancel}>
      <>
        <ModalTitle>
          {t('Confirmation')}
        </ModalTitle>
        <p>
          {t(`Pinned messages will remain for around 3 weeks, then it will
          get unpinned again`)}
        </p>
        <div className='w-full flex justify-between items-center'>
          <Button
            variant='outlined'
            onClick={onCancel}
          >
            {t('Cancel')}
          </Button>
          <Button
            onClick={handleConfirmation}
          >
            {t('Confirm and Pin')}
          </Button>
        </div>
      </>
    </Modal>
  );
};

export default PinMessageModal;
