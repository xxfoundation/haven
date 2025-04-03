import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'src/components/common';
import { useUI } from 'src/contexts/ui-context';
import ModalTitle from '../ModalTitle';
import React from 'react';

const NetworkNotReadyView: FC = () => {
  const { t } = useTranslation();
  const { closeModal } = useUI();

  return (
    <>
      <ModalTitle>{t('Network Not Ready')}</ModalTitle>
      <p className='mb-6 text-sm text-center text-charcoal-1'>
        {t('The network is not ready to send messages yet. Please try again in a few seconds.')}
      </p>
      <Button className='w-full' onClick={closeModal}>
        {t('Ok')}
      </Button>
    </>
  );
};

export default NetworkNotReadyView;
