import { type Channel, PrivacyLevel } from '@types';

import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Badge from './Badge';

const ChannelBadges: FC<Pick<Channel, 'privacyLevel' | 'isAdmin'>> = ({ isAdmin, privacyLevel}) => {
  const { t } = useTranslation();

  const privacyLevelLabels: Record<PrivacyLevel, string> = useMemo(() => ({
    [PrivacyLevel.Public]: t('Public'),
    [PrivacyLevel.Secret]: t('Secret')
  }), [t]);
  
  const privacyLevelDescriptions: Record<PrivacyLevel, string> = useMemo(() => ({
    [PrivacyLevel.Public]: t('Anyone can join this channel'),
    [PrivacyLevel.Secret]: t('Only people with a password can join this channel')
  }), [t]);

  return <>
    {isAdmin && (
      <Badge
        data-testid='channel-admin-badge'
        color='gold'
        title={t('You have admin privileges in this channel')}
      >
      {t('Admin')}
      </Badge>
    )}
    {privacyLevel !== null && (
      <Badge
        data-testid='channel-privacy-level-badge'
        color={privacyLevel === PrivacyLevel.Public ? 'gold' : 'grey'}
        title={privacyLevelDescriptions[privacyLevel]}
      >
        {privacyLevelLabels[privacyLevel]}
      </Badge>
    )}
  </>
}

export default ChannelBadges;
