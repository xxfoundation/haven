import type { Channel } from 'src/store/channels/types';

import React, { FC, useCallback, useMemo, useState } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faStar } from '@fortawesome/free-solid-svg-icons';
import assert from 'assert';

import { PrivacyLevel } from 'src/types';
import { useUtils } from 'src/contexts/utils-context';
import Ellipsis from '@components/icons/Ellipsis';
// import Edit from '@components/icons/Edit';
import { useUI } from '@contexts/ui-context';
import { useAppSelector } from 'src/store/hooks';
import * as channels from 'src/store/channels';
import * as app from 'src/store/app';

import s from './styles.module.scss';
import Badge from '../Badge';
import useChannelFavorites from 'src/hooks/useChannelFavorites';
import * as dms from 'src/store/dms';
import { DMNotificationLevel } from '@types';
import { useNetworkClient } from '@contexts/network-client-context';
import Dropdown, { DropdownItem } from '../Dropdown';
import Notice from '@components/icons/Notice';
import Share from '@components/icons/Share';
import BannedUser from '@components/icons/BannedUser';
import ViewPinned from '@components/icons/ViewPinned';
import Leave from '@components/icons/Leave';

type Props = Omit<Channel, 'name' | 'description' | 'currentPage'> & {
  name: React.ReactNode;
}

const ChannelHeader: FC<Props> = ({
  id,
  isAdmin,
  name,
  privacyLevel
}) => {
  const { t } = useTranslation();
  const { utils } = useUtils();
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const conversationId = useAppSelector(dms.selectors.currentConversation)?.pubkey;
  const channelId = useAppSelector(app.selectors.currentChannelOrConversationId);
  const { dmClient } = useNetworkClient();
  const [dropdownToggled, setDropdownToggle] = useState(false);
  const { isFavorite, toggle: toggleFavorite } = useChannelFavorites();
  const notificationLevel = useAppSelector(dms.selectors.notificationLevel(conversationId))
  
  const isChannelFavorited = useMemo(() => isFavorite(channelId), [isFavorite, channelId])
  const { openModal, setModalView } = useUI();
  const openShareModal = useCallback(() => {
    if (currentChannel) {
      setModalView('SHARE_CHANNEL');
      openModal();
    }
  }, [currentChannel, openModal, setModalView]);

  const privacyLevelLabels: Record<PrivacyLevel, string> = useMemo(() => ({
    [PrivacyLevel.Public]: t('Public'),
    [PrivacyLevel.Secret]: t('Secret')
  }), [t]);
  
  const privacyLevelDescriptions: Record<PrivacyLevel, string> = useMemo(() => ({
    [PrivacyLevel.Public]: t('Anyone can join this channel'),
    [PrivacyLevel.Secret]: t('Only people with a password can join this channel')
  }), [t]);

  const toggleNotifications = useCallback(() => {
    assert(conversationId, 'Conversation ID required to set notification level');
    dmClient?.SetMobileNotificationsLevel(
      utils.Base64ToUint8Array(conversationId),
      notificationLevel === DMNotificationLevel.NotifyNone
        ? DMNotificationLevel.NotifyAll
        : DMNotificationLevel.NotifyNone
    )
  }, [conversationId, dmClient, notificationLevel, utils]);

  return (
    <div data-testid='channel-header' className={cn('flex', s.root)}>
      <div className='flex-grow'>
        <div data-testid='channel-name' className={s.channelName}>
          {name}
        </div>
        <div>
        <div className={cn(s.channelId, 'space-x-2')}>
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
          <span className={s.channelId}>
            (id: {id})
          </span>
        </div>
        </div>
      </div>
      <div className='flex space-x-4 items-center relative'>
        <FontAwesomeIcon
          onClick={() => channelId && toggleFavorite(channelId)}
          className={cn(s.icon, isChannelFavorited ? s.gold : s.grey )} icon={faStar} />
        {currentChannel && (
          <>
            <Ellipsis onClick={() => { setDropdownToggle(true); }} className={s.icon} />
            <Dropdown isOpen={dropdownToggled} onChange={setDropdownToggle}>
              <DropdownItem icon={Notice}>
                {t('Space Details')}
              </DropdownItem>
              {/* {currentChannel.isAdmin && (
                <DropdownItem icon={Edit}>
                  {t('Edit Space')}
                </DropdownItem>
              )} */}
              <DropdownItem
                onClick={openShareModal}
                icon={Share}>
                {t('Share Space')}
              </DropdownItem>
              <DropdownItem
                icon={BannedUser}
                onClick={() => {
                  setModalView('VIEW_MUTED_USERS');
                  openModal();
                }}
              >
                {t('View Muted Users')}
              </DropdownItem>
              <DropdownItem icon={ViewPinned}>
                {t('View Pinned Messages')}
              </DropdownItem>
              <DropdownItem onClick={() => {
                setModalView('LEAVE_CHANNEL_CONFIRMATION');
                openModal();
              }} icon={Leave}>
                {t('Leave Space')}
              </DropdownItem>
            </Dropdown>
          </>
        )}
        {conversationId && (
          <FontAwesomeIcon
            onClick={toggleNotifications}
            className={cn(s.icon, notificationLevel === DMNotificationLevel.NotifyAll ? s.gold : s.grey)}
            icon={faBell}
          />
        )}
      </div>
    </div>
  );
}

export default ChannelHeader;
