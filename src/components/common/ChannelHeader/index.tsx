import type { Channel } from 'src/store/channels/types';

import React, { FC, HTMLAttributes, SVGProps, useCallback, useMemo, useState } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import assert from 'assert';

import Ellipsis from '@components/icons/Ellipsis';
import { useUI } from '@contexts/ui-context';
import { useAppSelector } from 'src/store/hooks';

import * as dms from 'src/store/dms';
import * as messages from 'src/store/messages';
import * as channels from 'src/store/channels';
import * as app from 'src/store/app';

import useChannelFavorites from 'src/hooks/useChannelFavorites';
import { ChannelNotificationLevel, DMNotificationLevel, NotificationStatus } from '@types';
import Dropdown, { DropdownItem } from '../Dropdown';
import Notice from '@components/icons/Notice';
import Share from '@components/icons/Share';
import BannedUser from '@components/icons/BannedUser';
import ViewPinned from '@components/icons/ViewPinned';
import Leave from '@components/icons/Leave';
import Block from '@components/icons/Block';
import useDmClient from 'src/hooks/useDmClient';
import NotificationsIcon from '@components/icons/Notifications';
import { Pin } from '@components/icons';

import s from './styles.module.scss';
import ChannelBadges from '../ChannelBadges';
import Contributors from '@components/icons/Contributors';
import Keys from '@components/icons/Keys';
import LockOpen from '@components/icons/LockOpen';
import { useNetworkClient } from '@contexts/network-client-context';
import { useUtils } from '@contexts/utils-context';
import classNames from 'classnames';

type Props = Omit<Channel, 'name' | 'description' | 'currentPage'> & {
  name: React.ReactNode;
}

const HeaderButton: FC<HTMLAttributes<HTMLButtonElement> & { notification?: boolean, active?: boolean }> = (props) => (
  <button
    {...props}
    className={cn(
      'relative w-8 h-8 p-1 hover:text-primary hover:bg-charcoal-3-20 rounded-full',
      props.className,
      {
        'text-primary': props.active,
        'text-charcoal-1': !props.active 
      }
    )}>
    {props.children}
    {props.notification && (
      <div className='rounded-full w-2 h-2 absolute bottom-1 right-1 bg-red' />
    )}
  </button>
);

const ChannelHeader: FC<Props> = ({
  id,
  isAdmin,
  name,
  privacyLevel
}) => {
  const { t } = useTranslation();
  const { utils } = useUtils();
  const { channelManager } = useNetworkClient();
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const conversationId = useAppSelector(dms.selectors.currentConversation)?.pubkey;
  const channelId = useAppSelector(app.selectors.currentChannelOrConversationId);
  const [dropdownToggled, setDropdownToggle] = useState(false);
  const { isFavorite, toggle: toggleFavorite } = useChannelFavorites();
  const isBlocked = useAppSelector(dms.selectors.isBlocked(conversationId ?? ''));
  const { toggleBlocked, toggleDmNotificationLevel } = useDmClient();
  const dmNotificationLevel = useAppSelector(dms.selectors.notificationLevel(conversationId));
  const isChannelFavorited = useMemo(() => isFavorite(channelId), [isFavorite, channelId])
  const { openModal, setModalView, setRightSidebarView } = useUI();
  const pinnedMessages = useAppSelector(messages.selectors.currentPinnedMessages);
  const channelNotificationLevel = useAppSelector(channels.selectors.notificationLevel(currentChannel?.id));
  const channelNotificationsEnabled = channelNotificationLevel === ChannelNotificationLevel.NotifyPing;

  const openShareModal = useCallback(() => {
    if (currentChannel) {
      setModalView('SHARE_CHANNEL');
      openModal();
    }
  }, [currentChannel, openModal, setModalView]);

  const toggleDMNotifications = useCallback(() => {
    assert(conversationId, 'Conversation ID required to set notification level');
    toggleDmNotificationLevel(conversationId);
  }, [toggleDmNotificationLevel, conversationId]);

  const toggleChannelNotifications =  useCallback(() => {
    const newLevel = channelNotificationLevel === ChannelNotificationLevel.NotifyPing
      ? ChannelNotificationLevel.NotifyNone
      : ChannelNotificationLevel.NotifyPing;
    const newState = newLevel === ChannelNotificationLevel.NotifyPing
      ? NotificationStatus.WhenOpen
      : NotificationStatus.Mute;

    if (currentChannel?.id) {
      channelManager?.SetMobileNotificationsLevel(
        utils.Base64ToUint8Array(currentChannel?.id),
        newLevel,
        newState
      )
    }
  }, [channelManager, channelNotificationLevel, currentChannel?.id, utils]);

  return (
    <div data-testid='channel-header' className={cn('flex', s.root)}>
      <div className='flex-grow'>
        <div data-testid='channel-name' className={s.channelName}>
          {name}
        </div>
        <div>
        <div className={cn(s.channelId, 'space-x-2')}>
          <ChannelBadges privacyLevel={privacyLevel}  isAdmin={isAdmin} />
          <span className={s.channelId}>
            ID: {id}
          </span>
        </div>
        </div>
      </div>
      <div className='flex space-x-2 items-center relative'>
        <HeaderButton
          active={!!isChannelFavorited}
          onClick={() => channelId && toggleFavorite(channelId)}>
          <FontAwesomeIcon title='Favorite the channel' className='w-5' icon={faStar} />
        </HeaderButton>
        {currentChannel && (
          <>
            <HeaderButton
              notification={!!pinnedMessages?.length}
              onClick={() => { setRightSidebarView('pinned-messages') }}>
              <Pin className='w-full h-full' />
            </HeaderButton>
            <HeaderButton onClick={() => setRightSidebarView('contributors')}>
              <Contributors />
            </HeaderButton>
          </>
        )}
        <HeaderButton onClick={() => { setDropdownToggle(true); }}>
          <Ellipsis className='w-full h-full' />
        </HeaderButton>
        <Dropdown isOpen={dropdownToggled} onChange={setDropdownToggle}>
          {conversationId && (
            <>
              <DropdownItem onClick={() => toggleBlocked(conversationId)} icon={Block}>
                {isBlocked ? t('Unblock') : t('Block')}
              </DropdownItem>
              <DropdownItem
                onClick={toggleDMNotifications} icon={NotificationsIcon}>
                {dmNotificationLevel === DMNotificationLevel.NotifyNone ? t('Enable Notifications') : t('Disable Notifications')}
              </DropdownItem>
            </>
          )}
          {currentChannel && (
          <>
            <DropdownItem
              onClick={toggleChannelNotifications}
              icon={
                (props: SVGProps<SVGSVGElement>) =>
                  <NotificationsIcon {...props} className={classNames(props.className, {
                    'text-primary': channelNotificationsEnabled,
                    'text-charcoal-1': !channelNotificationsEnabled
                  })} />
              }>
              {channelNotificationsEnabled ? t('Disable Notifications') : t('Enable Notifications')}
            </DropdownItem>
            <DropdownItem onClick={() => { setRightSidebarView('space-details'); }}icon={Notice}>
              {t('Space Details')}
            </DropdownItem>
            <DropdownItem
              onClick={openShareModal}
              icon={Share}>
              {t('Share Space')}
            </DropdownItem>
            <DropdownItem
              icon={BannedUser}
              onClick={() => {
                setRightSidebarView('muted-users');
              }}
            >
              {t('View Muted Users')}
            </DropdownItem>
            <DropdownItem onClick={() => {
              setRightSidebarView('pinned-messages');
            }} icon={ViewPinned}>
              {t('View Pinned Messages')}
            </DropdownItem>
            {currentChannel?.isAdmin ? (
              <DropdownItem icon={Keys} onClick={() => {
                setModalView('EXPORT_ADMIN_KEYS');
                openModal();
              }}>
                {t('Export Admin Keys')}
              </DropdownItem>
          ) : (
            <DropdownItem onClick={() => { setModalView('CLAIM_ADMIN_KEYS'); openModal(); }} icon={LockOpen}>
                {t('Claim Admin Keys')}
            </DropdownItem>
          )}
            <DropdownItem onClick={() => {
              setModalView('LEAVE_CHANNEL_CONFIRMATION');
              openModal();
            }} icon={Leave}>
              {t('Leave Space')}
            </DropdownItem>
          </>
        )}
        </Dropdown>
      </div>
    </div>
  );
}

export default ChannelHeader;
