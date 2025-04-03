import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'src/components/common';
import Modal from 'src/components/modals/Modal';
import { MuteUserAction } from 'src/types';
import ModalTitle from '../ModalTitle';

type Props = {
  onConfirm: (action: MuteUserAction) => Promise<void>;
  onCancel: () => void;
};

const MuteUserModal: FC<Props> = ({ onCancel, onConfirm }) => {
  const { t } = useTranslation();

  const handleMute = useCallback(async () => {
    await onConfirm('mute');
  }, [onConfirm]);

  const handleMuteAndDelete = useCallback(async () => {
    await onConfirm('mute+delete');
  }, [onConfirm]);

  return (
    <Modal onClose={onCancel}>
      <ModalTitle>{t('Warning')}</ModalTitle>
      <p className='mb-4 text-red uppercase text-center'>
        ** {t('Important to note that muting users cannot be undone.')} **
      </p>
      <div className='flex flex-wrap justify-center -mx-2'>
        <Button variant='outlined' className='m-2' onClick={onCancel}>
          {t('Cancel')}
        </Button>
        <Button className='m-2' onClick={handleMute}>
          {t('Mute')}
        </Button>
        <Button className='m-2' onClick={handleMuteAndDelete}>
          {t('Mute and Delete Messages')}
        </Button>
      </div>
    </Modal>
  );
};

export default MuteUserModal;
