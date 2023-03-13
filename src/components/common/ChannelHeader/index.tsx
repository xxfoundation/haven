import type { Channel } from 'src/store/channels/types';

import React, { FC, useCallback } from 'react';
import cn from 'classnames';

import { PrivacyLevel } from 'src/contexts/utils-context';
import Ellipsis from '@components/icons/Ellipsis';
import Share from '@components/icons/Share';
import { useUI } from '@contexts/ui-context';
import { useAppSelector } from 'src/store/hooks';
import * as channels from 'src/store/channels';

import s from './styles.module.scss';

const privacyLevelLabels: Record<PrivacyLevel, string> = {
  [PrivacyLevel.Private]: 'Private',
  [PrivacyLevel.Public]: 'Public',
  [PrivacyLevel.Secret]: 'Secret'
};

const privacyLevelDescriptions: Record<PrivacyLevel, string> = {
  [PrivacyLevel.Private]: '',
  [PrivacyLevel.Public]: 'Anyone can join this channel',
  [PrivacyLevel.Secret]: 'Only people with a password can join this channel'
};

type Props = Omit<Channel, 'name' | 'currentPage'> & {
  name: React.ReactNode;
}

const ChannelHeader: FC<Props> = ({
  description,
  id,
  isAdmin,
  name,
  privacyLevel
}) => {
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const { openModal, setModalView } = useUI();
  const openShareModal = useCallback(() => {
    if (currentChannel) {
      setModalView('SHARE_CHANNEL');
      openModal();
    }
  }, [currentChannel, openModal, setModalView]);

  const openChannelSettings = useCallback(() => {
    if (currentChannel) {
      setModalView('CHANNEL_SETTINGS');
      openModal();
    }
  }, [currentChannel, openModal, setModalView]);

  return (
    <div className={s.root}>
      <div className='flex justify-between'>
        <div className={'headline--sm flex flex-wrap items-center'}>
          {privacyLevel !== null && (
            <span
              className={cn(s.badge, {
                [s.gold]: privacyLevel === PrivacyLevel.Public
              })}
              title={privacyLevelDescriptions[privacyLevel]}
            >
              {privacyLevelLabels[privacyLevel]}
            </span>
          )}
          {isAdmin && (
            <span
              className={cn(s.badge, s.gold, s.outlined)}
              title='You have admin privileges in this channel'
            >
            Admin
            </span>
          )}
          <span className={cn('mr-2', s.channelName)}>
            {name}{' '}
          </span>
        </div>
        <div className='flex space-x-2 mt-1'>
          {currentChannel && (
            <>
              <Share
                className={s.icon}
                onClick={openShareModal} />
              <Ellipsis onClick={openChannelSettings} className={s.icon} />
            </>
          )}
          
        </div>
      </div>
      <p>
        <span className={cn('headline--xs break-all', s.channelId)}>
          (id: {id})
        </span>
      </p>
      <p className={'text mt-2'}>{description}</p>
    </div>
  );
}

export default ChannelHeader;
