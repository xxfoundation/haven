import { FC, useCallback } from 'react';
import s from './LeaveChannelConfirmationView.module.scss';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import { PrimaryButton, SecondaryButton } from 'src/components/common';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { useUI } from 'src/contexts/ui-context';
import * as channels from 'src/store/channels';
import { useAppSelector } from 'src/store/hooks';

const LeaveChannelConfirmationView: FC = () => {
  const { t } = useTranslation();
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const {  leaveCurrentChannel } = useNetworkClient();
  const { closeModal } = useUI();

  const onLeave = useCallback(() => {
    leaveCurrentChannel();
    closeModal();
  }, [closeModal, leaveCurrentChannel]);

  return (
    <div
      className={cn('w-full flex flex-col justify-center items-center', s.root)}
    >
      <h2 className='text-center leading-8 font-bold mt-9 mb-4'>
        {t(
          'Are you sure you want to leave {{channelName}} Speakeasy?',
          { channelName: currentChannel?.name }
        )}
      </h2>

      <div className='flex'>
        <SecondaryButton
          className='mt-5 mb-10 mr-5'
          style={{
            borderColor: 'var(--red)'
          }}
          onClick={closeModal}
        >
          {t('Cancel')}
        </SecondaryButton>
        <PrimaryButton
          className='mt-5 mb-10'
          onClick={onLeave}
        >
          {t('Leave')}
        </PrimaryButton>
      </div>
    </div>
  );
};

export default LeaveChannelConfirmationView;
