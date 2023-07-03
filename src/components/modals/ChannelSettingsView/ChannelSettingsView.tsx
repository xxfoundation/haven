import { ChangeEventHandler, FC, useCallback } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import { useUI } from 'src/contexts/ui-context';
import * as channels from 'src/store/channels';
import { useAppSelector } from 'src/store/hooks';

import s from './ChannelSettingsView.module.scss';
import Keys from '@components/icons/Keys';
import LockOpen from '@components/icons/LockOpen';
import CommentSlash from '@components/icons/CommentSlash';
import RightFromBracket from '@components/icons/RightFromBracket';
import { useNetworkClient } from '@contexts/network-client-context';
import CheckboxToggle from '@components/common/CheckboxToggle';
import { Spinner } from '@components/common';
import { ChannelNotificationLevel, NotificationStatus } from '@types';
import { useUtils } from '@contexts/utils-context';
import { notificationLevelDecoder, notificationStatusDecoder } from '@utils/decoders';

const ChannelSettingsView: FC = () => {
  const { t } = useTranslation();
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const { openModal, setModalView } = useUI();
  const { utils } = useUtils();
  const { channelManager } = useNetworkClient();
  const dmsEnabled = useAppSelector(channels.selectors.dmsEnabled(currentChannel?.id));
  const notificationLevel = useAppSelector(channels.selectors.notificationLevel(currentChannel?.id));
  const notificationStatus = useAppSelector(channels.selectors.notificationStatus(currentChannel?.id));

  const toggleDms = useCallback(() => {
    if (!currentChannel || !channelManager) {
      return;
    }

    const fn = dmsEnabled ? 'DisableDirectMessages' : 'EnableDirectMessages'
    channelManager?.[fn](Buffer.from(currentChannel.id, 'base64'));
  }, [channelManager, currentChannel, dmsEnabled]);

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

  return (
    <>
      <div
        className={cn(s.root, 'w-full flex flex-col justify-center items-center')}
      >
        <h2 className='mt-9 mb-8'>
          {t('Channel Settings')}
        </h2>
        <div className={s.wrapper}>
          <div>
            <h3 className='headline--sm'>
              {t('Enable Direct Messages')}
            </h3>
            {dmsEnabled === null ? <Spinner className='m-0 mr-1' /> : (
              <CheckboxToggle checked={dmsEnabled} onChange={toggleDms} />
            )}
          </div>
          {currentChannel?.isAdmin ? (
            <div>
              <h3 className='headline--sm'>
                {t('Export Admin Keys')}
              </h3>
              <Keys
                onClick={() => {
                  setModalView('EXPORT_ADMIN_KEYS');
                  openModal();
                }}
              />
            </div>
          ) : (
            <div>
              <h3 className='headline--sm'>
                {t('Claim Admin Keys')}</h3>
              <LockOpen onClick={() => {
                setModalView('CLAIM_ADMIN_KEYS');
                openModal();
              }} />
            </div>
          )}
          <div>
            <h3 className='headline--sm'>
              {t('View Muted Users')}
            </h3>
            <CommentSlash
              onClick={() => {
                setModalView('VIEW_MUTED_USERS');
                openModal();
              }}
            />
          </div>
          <div>
            <h3 className='headline--sm'>
              {t('Notifications')}
            </h3>
            <select
              className={s.select}
              onChange={onNotificationStatusChange}
              value={notificationStatus}
              id='notification-levels'>
              <option value={NotificationStatus.WhenOpen}>When Open</option>
              <option value={NotificationStatus.Push}>Push</option>
              <option value={NotificationStatus.Mute}>Mute</option>
            </select>
          </div>
          <div>
            <h3 className='headline--sm'>
              {t('Notification Level')}
            </h3>
            <select
              className={s.select}
              onChange={onNotificationLevelChange}
              value={notificationLevel}
              id='notification-levels'>
              <option value={ChannelNotificationLevel.NotifyAll}>All</option>
              <option value={ChannelNotificationLevel.NotifyPing}>Tags, replies, and pins</option>
              <option value={ChannelNotificationLevel.NotifyNone}>None</option>
            </select>
          </div>
          <div>
            <h3 className='headline--sm'>
              {t('Leave Channel')}
            </h3>
            <RightFromBracket
              onClick={() => {
                if (currentChannel) {
                  setModalView('LEAVE_CHANNEL_CONFIRMATION');
                  openModal();
                }
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChannelSettingsView;
