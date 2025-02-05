import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'src/components/common';
import Modal from 'src/components/modals/Modal';
import ModalTitle from '../ModalTitle';

type Props = {
  onConfirm: () => Promise<void>;
  onCancel: () => void;
};

const DeleteMessageModal: FC<Props> = ({ onCancel, onConfirm }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleConfirmation = useCallback(async () => {
    setLoading(true);
    await onConfirm().finally(() => {
      setLoading(false);
    });
  }, [onConfirm]);

  return (
    <Modal loading={loading} onClose={onCancel}>
      <ModalTitle>{t('Warning')}</ModalTitle>
      <p className="mb-4 text-red uppercase text-center">
        ** {t('Important to note that deleting messages cannot be undone.')} **
      </p>
      <div className="flex flex-wrap justify-center -mx-2">
        <Button variant="outlined" className="m-2" onClick={onCancel}>
          {t('Cancel')}
        </Button>
        <Button className="m-2" onClick={handleConfirmation}>
          {t('Delete')}
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteMessageModal;
