import type { Channel } from '@contexts/network-client-context';

import React, { FC } from 'react';
import cn from 'classnames';

import s from './styles.module.scss';
import { PrivacyLevel } from 'src/contexts/utils-context';

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

const ChannelHeader: FC<Channel> = ({
  description,
  id,
  isAdmin,
  name,
  privacyLevel
}) => (
  <div className={s.root}>
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
      <span className={cn('headline--xs break-all', s.channelId)}>
        (id: {id})
      </span>
    </div>
    <p className={'text mt-2'}>{description}</p>
  </div>
);

export default ChannelHeader;
