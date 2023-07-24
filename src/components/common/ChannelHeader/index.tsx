import type { Channel } from 'src/store/channels/types';

import React, { FC, HTMLAttributes, useCallback, useMemo, useState } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import assert from 'assert';

import Ellipsis from '@components/icons/Ellipsis';
// import Edit from '@components/icons/Edit';
import { useUI } from '@contexts/ui-context';
import { useAppSelector } from 'src/store/hooks';

import * as dms from 'src/store/dms';
import * as messages from 'src/store/messages';
import * as channels from 'src/store/channels';
import * as app from 'src/store/app';

import useChannelFavorites from 'src/hooks/useChannelFavorites';
import { DMNotificationLevel } from '@types';
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

type Props = Omit<Channel, 'name' | 'description' | 'currentPage'> & {
  name: React.ReactNode;
}

const HeaderButton: FC<HTMLAttributes<HTMLButtonElement> & { notification?: boolean }> = (props) => (
  <button
    {...props}
    className={cn('relative w-8 h-8 p-1 text-charcoal-1 hover:text-primary hover:bg-charcoal-3-20 rounded-full', props.className)}>
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
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const conversationId = useAppSelector(dms.selectors.currentConversation)?.pubkey;
  const channelId = useAppSelector(app.selectors.currentChannelOrConversationId);
  const [dropdownToggled, setDropdownToggle] = useState(false);
  const { isFavorite, toggle: toggleFavorite } = useChannelFavorites();
  const isBlocked = useAppSelector(dms.selectors.isBlocked(conversationId ?? ''));
  const { toggleBlocked, toggleDmNotificationLevel } = useDmClient();
  const notificationLevel = useAppSelector(dms.selectors.notificationLevel(conversationId));
  const isChannelFavorited = useMemo(() => isFavorite(channelId), [isFavorite, channelId])
  const { openModal, setModalView, setRightSidebarView } = useUI();
  const pinnedMessages = useAppSelector(messages.selectors.currentPinnedMessages);
  const openShareModal = useCallback(() => {
    if (currentChannel) {
      setModalView('SHARE_CHANNEL');
      openModal();
    }
  }, [currentChannel, openModal, setModalView]);

  const toggleNotifications = useCallback(() => {
    assert(conversationId, 'Conversation ID required to set notification level');
    toggleDmNotificationLevel(conversationId);
  }, [toggleDmNotificationLevel, conversationId]);

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
            (id: {id})
          </span>
        </div>
        </div>
      </div>
      <div className='flex space-x-2 items-center relative'>
        <HeaderButton
          className={isChannelFavorited ? 'text-primary' : 'text-charcoal-1'}
          onClick={() => channelId && toggleFavorite(channelId)}>
          <FontAwesomeIcon className='' icon={faStar} />
        </HeaderButton>
        {currentChannel && (
          <HeaderButton
            notification={!!pinnedMessages?.length}
            onClick={() => { setRightSidebarView('pinned-messages') }}>
            <Pin className='w-full h-full' />
          </HeaderButton>
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
                onClick={toggleNotifications} icon={NotificationsIcon}>
                {notificationLevel === DMNotificationLevel.NotifyNone ? t('Enable Notifications') : t('Disable Notifications')}
              </DropdownItem>
            </>
          )}
          {currentChannel && (
          <>
            <DropdownItem onClick={() => { setRightSidebarView('space-details'); }}icon={Notice}>
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
          </>
        )}
        </Dropdown>
      </div>
    </div>
  );
}

export default ChannelHeader;
