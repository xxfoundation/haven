import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from 'src/components/common';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { useUI } from 'src/contexts/ui-context';
import * as channels from 'src/store/channels';
import { useAppSelector } from 'src/store/hooks';
import ModalTitle from '../ModalTitle';
import Leave from '@components/icons/Leave';

const LeaveChannelConfirmationView: FC = () => {
  const { t } = useTranslation();
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const {  leaveCurrentChannel } = useNetworkClient();
  const { alert, closeModal } = useUI();

  const onLeave = useCallback(() => {
    leaveCurrentChannel();
    closeModal(); 
    alert({
      type: 'success',
      icon: Leave,
      content: t('You have left'),
      description: currentChannel?.name
    })
  }, [alert, closeModal, currentChannel?.name, leaveCurrentChannel, t]);

  return (
    <>
      <ModalTitle className='mb-0'>
        {t('Leave Space')}
      </ModalTitle>
      <h2>
        {currentChannel?.name}
      </h2>
      <p className='text-charcoal-1'>
        {t('Are you sure you would like to leave this space?')}
      </p>
      <Button
        className='w-full'
        onClick={onLeave}
      >
        {t('Yes, leave this space')}
      </Button>
    </>
  );
};

export default LeaveChannelConfirmationView;
