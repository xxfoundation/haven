import { ChangeEventHandler, useCallback } from 'react';

import CloseButton from '../CloseButton';
import { useUI } from '@contexts/ui-context';
import { useAppSelector } from 'src/store/hooks';
import { useTranslation } from 'react-i18next';
import { fullIdentity } from 'src/store/selectors';
import * as channels from 'src/store/channels';
import RightSideTitle from './RightSideTitle';
import { ChannelNotificationLevel, NotificationStatus } from '@types';
import { useUtils } from '@contexts/utils-context';
import { useNetworkClient } from '@contexts/network-client-context';
import { notificationLevelDecoder, notificationStatusDecoder } from '@utils/decoders';

const ChannelNotifications = () => {
  const { utils } = useUtils();
  const { t } = useTranslation();
  const { channelManager } = useNetworkClient();
  const { setRightSidebarView } = useUI();
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const identity = useAppSelector(fullIdentity);
  const notificationLevel = useAppSelector(channels.selectors.notificationLevel(currentChannel?.id));
  const notificationStatus = useAppSelector(channels.selectors.notificationStatus(currentChannel?.id));

  const correctInvalidNotificationStates = useCallback((level = ChannelNotificationLevel.NotifyPing, status = NotificationStatus.WhenOpen) => {
    const previousStatus = notificationStatus;
    const previousLevel = notificationLevel;
  
    const notificationStatusMuted = status === NotificationStatus.Mute && previousStatus !== NotificationStatus.Mute;
    const notificationStatusUnmuted = status !== NotificationStatus.Mute && previousStatus === NotificationStatus.Mute;
    const notificationLevelMuted = level === ChannelNotificationLevel.NotifyNone && previousLevel !== ChannelNotificationLevel.NotifyNone;
    const notificationLevelUnmuted = level !== ChannelNotificationLevel.NotifyNone && previousLevel === ChannelNotificationLevel.NotifyNone;
  
    let stat = status;
    let lev = level;
  
    if (notificationStatusMuted) {
      lev = ChannelNotificationLevel.NotifyNone;
    }
  
    if (notificationStatusUnmuted && lev === ChannelNotificationLevel.NotifyNone) {
      lev = ChannelNotificationLevel.NotifyPing;
    }
  
    if (notificationLevelMuted) {
      stat = NotificationStatus.Mute;
    }
  
    if (notificationLevelUnmuted && stat === NotificationStatus.Mute) {
      stat = NotificationStatus.WhenOpen;
    }
  
    return [lev, stat] as [ChannelNotificationLevel, NotificationStatus];
  }, [notificationLevel, notificationStatus]);

  const changeNotificationLevel = useCallback((level: ChannelNotificationLevel) => {
    if (currentChannel?.id) {
      channelManager?.SetMobileNotificationsLevel(
        utils.Base64ToUint8Array(currentChannel?.id),
        ...correctInvalidNotificationStates(level, notificationStatus)
      )
    }
  }, [channelManager, correctInvalidNotificationStates, currentChannel?.id, notificationStatus, utils]);

  const onNotificationLevelChange = useCallback<ChangeEventHandler<HTMLSelectElement>>((evt) => {
    const level = notificationLevelDecoder.decode(parseInt(evt.target.value, 10));
    if (level.isOk()) {
      changeNotificationLevel(level.value);
    } else {
      throw new Error(`Unknown notification level ${level.error}`)
    }
  }, [changeNotificationLevel]);

  const changeNotificationStatus = useCallback((status: NotificationStatus) => {
    if (currentChannel?.id) {
      const level = status === NotificationStatus.Mute ? ChannelNotificationLevel.NotifyNone : (notificationLevel || ChannelNotificationLevel.NotifyPing);
      
      channelManager?.SetMobileNotificationsLevel(
        utils.Base64ToUint8Array(currentChannel?.id),
        ...correctInvalidNotificationStates(level, status)
      )
    }
  }, [currentChannel?.id, notificationLevel, channelManager, utils, correctInvalidNotificationStates]);

  const onNotificationStatusChange = useCallback<ChangeEventHandler<HTMLSelectElement>>((evt) => {
    const status = notificationStatusDecoder.decode(parseInt(evt.target.value, 10));
    if (status.isOk()) {
      changeNotificationStatus(status.value);
    } else {
      throw new Error(`Unknown notification status: ${status.error}`);
    }
  }, [changeNotificationStatus]);

  return (currentChannel && identity) ? (
    <div className='p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <RightSideTitle>
          {t('Notifications')}
        </RightSideTitle>
        <CloseButton className='w-8 h-8' onClick={() => setRightSidebarView(null) } />
      </div>
      <div className='flex justify-between items-center'>
        <h5>{t('Enabled')}</h5>
        <select
          className='bg-charcoal-4 p-3 border border-charcoal-1 rounded-lg hover:border-primary cursor-pointer pr-2'
          onChange={onNotificationStatusChange}
          value={notificationStatus}
          id='notification-levels'>
          <option value={NotificationStatus.WhenOpen}>When Open</option>
          <option value={NotificationStatus.Push}>Push</option>
          <option value={NotificationStatus.Mute}>Mute</option>
        </select>
      </div>
      <div className='flex justify-between items-center'>
        <h6>{t('Level')}</h6>
        <select
          className='bg-charcoal-4 p-3 border border-charcoal-1 rounded-lg hover:border-primary cursor-pointer pr-2'
          onChange={onNotificationLevelChange}
          value={notificationLevel}
          id='notification-levels'>
          <option value={ChannelNotificationLevel.NotifyAll}>All</option>
          <option value={ChannelNotificationLevel.NotifyPing}>Tags, replies, and pins</option>
          <option value={ChannelNotificationLevel.NotifyNone}>None</option>
        </select>
      </div>
    </div>
  ) : null;
}

export default ChannelNotifications;
