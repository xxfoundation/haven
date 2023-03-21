import { FC } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

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
        {loading ? (<Loading />) : (
          <>
            <h2 className={cn('mt-9 mb-4')}>
              {t('Confirmation')}
            </h2>
            <p className='mb-4'>
              {t(`Pinned messages will remain for around 3 weeks, then it will
              get unpinned again`)}
            </p>
            <div className={cn('mb-6', s.buttonGroup)}>
              <ModalCtaButton
                buttonCopy={t('Confirm and Pin')}
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

export default PinMessageModal;
