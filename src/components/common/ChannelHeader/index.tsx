import type { Channel } from 'src/store/channels/types';

import React, { FC, HTMLAttributes, SVGProps, useCallback, useMemo, useState } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

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
import { Star } from 'lucide-react';

type Props = Omit<Channel, 'name' | 'description' | 'currentPage'> & {
  name: React.ReactNode;
};

const HeaderMenuItem: FC<
  HTMLAttributes<HTMLButtonElement> & { notification?: boolean; active?: boolean }
> = (props) => (
  <li>
    <button
      {...props}
      className={cn(
        'cursor-pointer list-none relative w-8 h-8 p-1 hover:text-primary hover:bg-charcoal-3-20 rounded-full',
        props.className,
        {
          'text-primary': props.active,
          'text-charcoal-1': !props.active
        }
      )}
    >
      {props.children}
      {props.notification && (
        <div className='rounded-full w-2 h-2 absolute bottom-1 right-1 bg-red' />
      )}
    </button>
  </li>
);

const ChannelHeader: FC<Props> = ({ id, isAdmin, name, privacyLevel }) => {
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
  const isChannelFavorited = useMemo(() => isFavorite(channelId), [isFavorite, channelId]);
  const { openModal, setModalView, setRightSidebarView } = useUI();
  const pinnedMessages = useAppSelector(messages.selectors.currentPinnedMessages);
  const channelNotificationLevel = useAppSelector(
    channels.selectors.notificationLevel(currentChannel?.id)
  );
  const channelNotificationsEnabled =
    channelNotificationLevel === ChannelNotificationLevel.NotifyPing;

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

  const toggleChannelNotifications = useCallback(() => {
    const newLevel =
      channelNotificationLevel === ChannelNotificationLevel.NotifyPing
        ? ChannelNotificationLevel.NotifyNone
        : ChannelNotificationLevel.NotifyPing;
    const newState =
      newLevel === ChannelNotificationLevel.NotifyPing
        ? NotificationStatus.WhenOpen
        : NotificationStatus.Mute;

    if (currentChannel?.id) {
      channelManager?.SetMobileNotificationsLevel(
        utils.Base64ToUint8Array(currentChannel?.id),
        newLevel,
        newState
      );
    }
  }, [channelManager, channelNotificationLevel, currentChannel?.id, utils]);

  return (
    // .backButton {
    //   transition: color 0.3s ease;
    
    //   &:hover {
    //     color: var(--text-secondary);
    //   }
    // }

    <div data-testid='channel-header' className={cn('flex w-full', s.root)}>
      <label htmlFor="mobileToggle" className={'flex-none flex items-center text-xl cursor-pointer transition-colors ease-in duration-300 mr-4 hover:text-text-secondary md:hidden'}>
          &#8592; {/* Left arrow */}
      </label>
      <div className='flex-1 min-w-0'>
        <div data-testid='channel-name' className={cn(s.channelName, 'truncate')}>
          {name}
        </div>
        <div className='flex'>
          <div className={cn(s.channelId, 'flex space-x-2 truncate')}>
            <ChannelBadges privacyLevel={privacyLevel} isAdmin={isAdmin} />
            <span className={cn(s.channelId, 'truncate')}>ID: {id}</span>
          </div>
        </div>
      </div>
      
      <menu className='flex-none flex space-x-2 items-center relative'>
        <HeaderMenuItem
          active={!!isChannelFavorited}
          onClick={() => channelId && toggleFavorite(channelId)}
          className='hidden xs:list-item'
          title='Favorite this Space'
        >
          <Star className='w-5' strokeWidth='1' fill={isChannelFavorited? 'currentColor' : ''} />
        </HeaderMenuItem>
        {currentChannel && (
          <>
            <HeaderMenuItem
              onClick={() => setRightSidebarView('pinned-messages')}
              className='hidden xs:list-item'
            >
              <Pin className='w-full h-full' notification={!!pinnedMessages?.length}/>
            </HeaderMenuItem>
            <HeaderMenuItem 
              onClick={() => setRightSidebarView('contributors')}
              className='hidden xs:list-item'
            >
              <Contributors />
            </HeaderMenuItem>
          </>
        )}
        <HeaderMenuItem
          data-dropdown-trigger
          onClick={() => {
            setDropdownToggle(!dropdownToggled);
          }}
        >
          <Ellipsis className='w-full h-full' />
        </HeaderMenuItem>
        <Dropdown isOpen={dropdownToggled} onChange={setDropdownToggle}>
          {conversationId && (
            <>
              <DropdownItem onClick={() => toggleBlocked(conversationId)} icon={Block}>
                {isBlocked ? t('Unblock') : t('Block')}
              </DropdownItem>
              <DropdownItem onClick={toggleDMNotifications} icon={NotificationsIcon}>
                {dmNotificationLevel === DMNotificationLevel.NotifyNone
                  ? t('Enable Notifications')
                  : t('Disable Notifications')}
              </DropdownItem>
            </>
          )}
          {currentChannel && (
            <>
              <DropdownItem
                onClick={() => channelId && toggleFavorite(channelId)}
                className='xs:hidden'
                icon={(props: SVGProps<SVGSVGElement>) => (
                  <Star {...props} width='36' height='36' strokeWidth='1'
                    fill={isChannelFavorited? 'currentColor' : ''} 
                    className={cn(props.className,
                    {
                      'text-primary': !!isChannelFavorited,
                      'text-charcoal-1': isChannelFavorited
                    },)}
                  />
                )}
              >
                Favorite this Space
              </DropdownItem>
              {currentChannel && (
                <>
                  <DropdownItem
                    onClick={() => setRightSidebarView('pinned-messages')}
                    className='xs:hidden'
                    icon={(props: SVGProps<SVGSVGElement>) => (
                      <Pin {...props} width='36' height='36' notification={!!pinnedMessages?.length}/>
                    )}
                  >
                    Pinned Messages
                  </DropdownItem>
                  <DropdownItem 
                    onClick={() => setRightSidebarView('contributors')}
                    className='xs:hidden'
                    icon={(props: SVGProps<SVGSVGElement>) => (
                      <Contributors {...props}  width='36' height='36' />
                    )}
                  >
                    Space Contributors
                  </DropdownItem>
                </>
              )}
              <DropdownItem
                onClick={toggleChannelNotifications}
                icon={(props: SVGProps<SVGSVGElement>) => (
                  <NotificationsIcon
                    {...props}
                    className={classNames(props.className, {
                      'text-primary': channelNotificationsEnabled,
                      'text-charcoal-1': !channelNotificationsEnabled
                    })}
                  />
                )}
              >
                {channelNotificationsEnabled
                  ? t('Disable Notifications')
                  : t('Enable Notifications')}
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  setRightSidebarView('space-details');
                }}
                icon={Notice}
              >
                {t('Space Details')}
              </DropdownItem>
              <DropdownItem onClick={openShareModal} icon={Share}>
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
              <DropdownItem
                onClick={() => {
                  setRightSidebarView('pinned-messages');
                }}
                icon={ViewPinned}
              >
                {t('View Pinned Messages')}
              </DropdownItem>
              {currentChannel?.isAdmin ? (
                <DropdownItem
                  icon={Keys}
                  onClick={() => {
                    setModalView('EXPORT_ADMIN_KEYS');
                    openModal();
                  }}
                >
                  {t('Export Admin Keys')}
                </DropdownItem>
              ) : (
                <DropdownItem
                  onClick={() => {
                    setModalView('CLAIM_ADMIN_KEYS');
                    openModal();
                  }}
                  icon={LockOpen}
                >
                  {t('Claim Admin Keys')}
                </DropdownItem>
              )}
              <DropdownItem
                onClick={() => {
                  setModalView('LEAVE_CHANNEL_CONFIRMATION');
                  openModal();
                }}
                icon={Leave}
              >
                {t('Leave Space')}
              </DropdownItem>
            </>
          )}
        </Dropdown>
      </menu>
    </div>
  );
};

export default ChannelHeader;
