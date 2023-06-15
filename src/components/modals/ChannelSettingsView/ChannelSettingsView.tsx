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
import { NotificationLevel, NotificationStatus } from '@types';
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

  const changeNotificationLevel = useCallback((level: NotificationLevel) => {
    if (currentChannel?.id) {
      channelManager?.SetMobileNotificationsLevel(
        utils.Base64ToUint8Array(currentChannel?.id),
        level,
        notificationStatus || NotificationStatus.WhenOpen,
      )
    }
  }, [channelManager, currentChannel?.id, notificationStatus, utils]);

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
      channelManager?.SetMobileNotificationsLevel(
        utils.Base64ToUint8Array(currentChannel?.id),
        notificationLevel || NotificationLevel.NotifyPing,
        status,
      )
    }
  }, [channelManager, currentChannel?.id, notificationLevel, utils]);

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
              disabled={notificationStatus === NotificationStatus.Mute}
              id='notification-levels'>
              <option value={NotificationLevel.NotifyAll}>All</option>
              <option value={NotificationLevel.NotifyPing}>Tags, replies, and pins</option>
              <option value={NotificationLevel.NotifyNone}>None</option>
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
