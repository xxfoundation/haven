import { ChangeEventHandler, FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from 'src/contexts/ui-context';
import * as channels from 'src/store/channels';
import { useAppSelector } from 'src/store/hooks';
import Keys from 'src/components/icons/Keys';
import LockOpen from 'src/components/icons/LockOpen';
import RightFromBracket from 'src/components/icons/RightFromBracket';
import { useNetworkClient } from 'src/contexts/network-client-context';
import CheckboxToggle from 'src/components/common/CheckboxToggle';
import { Spinner } from 'src/components/common';
import { ChannelNotificationLevel, NotificationStatus } from '../../../types';
import { useUtils } from 'src/contexts/utils-context';
import { notificationLevelDecoder, notificationStatusDecoder } from 'src/utils/decoders';

const ChannelSettingsView: FC = () => {
  const { t } = useTranslation();
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const { openModal, setModalView } = useUI();
  const { utils } = useUtils();
  const { channelManager } = useNetworkClient();
  const dmsEnabled = useAppSelector(channels.selectors.dmsEnabled(currentChannel?.id));
  const notificationLevel = useAppSelector(
    channels.selectors.notificationLevel(currentChannel?.id)
  );
  const notificationStatus = useAppSelector(
    channels.selectors.notificationStatus(currentChannel?.id)
  );

  const toggleDms = useCallback(() => {
    if (!currentChannel || !channelManager) {
      return;
    }

    const fn = dmsEnabled ? 'DisableDirectMessages' : 'EnableDirectMessages';
    channelManager?.[fn](new Uint8Array(Buffer.from(currentChannel.id, 'base64')));
  }, [channelManager, currentChannel, dmsEnabled]);

  const correctInvalidNotificationStates = useCallback(
    (level = ChannelNotificationLevel.NotifyPing, status = NotificationStatus.WhenOpen) => {
      const previousStatus = notificationStatus;
      const previousLevel = notificationLevel;

      const notificationStatusMuted =
        status === NotificationStatus.Mute && previousStatus !== NotificationStatus.Mute;
      const notificationStatusUnmuted =
        status !== NotificationStatus.Mute && previousStatus === NotificationStatus.Mute;
      const notificationLevelMuted =
        level === ChannelNotificationLevel.NotifyNone &&
        previousLevel !== ChannelNotificationLevel.NotifyNone;
      const notificationLevelUnmuted =
        level !== ChannelNotificationLevel.NotifyNone &&
        previousLevel === ChannelNotificationLevel.NotifyNone;

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
    },
    [notificationLevel, notificationStatus]
  );

  const changeNotificationLevel = useCallback(
    (level: ChannelNotificationLevel) => {
      if (currentChannel?.id) {
        channelManager?.SetMobileNotificationsLevel(
          utils.Base64ToUint8Array(currentChannel?.id),
          ...correctInvalidNotificationStates(level, notificationStatus)
        );
      }
    },
    [
      channelManager,
      correctInvalidNotificationStates,
      currentChannel?.id,
      notificationStatus,
      utils
    ]
  );

  const onNotificationLevelChange = useCallback<ChangeEventHandler<HTMLSelectElement>>(
    (evt) => {
      const level = notificationLevelDecoder.decode(parseInt(evt.target.value, 10));
      if (level.isOk()) {
        changeNotificationLevel(level.value as unknown as ChannelNotificationLevel);
      } else {
        throw new Error(`Unknown notification level ${level.error}`);
      }
    },
    [changeNotificationLevel]
  );

  const changeNotificationStatus = useCallback(
    (status: NotificationStatus) => {
      if (currentChannel?.id) {
        const level =
          status === NotificationStatus.Mute
            ? ChannelNotificationLevel.NotifyNone
            : notificationLevel || ChannelNotificationLevel.NotifyPing;

        channelManager?.SetMobileNotificationsLevel(
          utils.Base64ToUint8Array(currentChannel?.id),
          ...correctInvalidNotificationStates(level, status)
        );
      }
    },
    [currentChannel?.id, notificationLevel, channelManager, utils, correctInvalidNotificationStates]
  );

  const onNotificationStatusChange = useCallback<ChangeEventHandler<HTMLSelectElement>>(
    (evt) => {
      const status = notificationStatusDecoder.decode(parseInt(evt.target.value, 10));
      if (status.isOk()) {
        changeNotificationStatus(status.value as unknown as NotificationStatus);
      } else {
        throw new Error(`Unknown notification status: ${status.error}`);
      }
    },
    [changeNotificationStatus]
  );

  return (
    <>
      <div className='w-full flex flex-col justify-center items-center'>
        <h2 className='mt-9 mb-8'>{t('Channel Settings')}</h2>
        <div className='w-full mb-[180px]'>
          <div className='mx-auto max-w-[30rem] flex justify-between items-center mb-9'>
            <h3 className='text-sm font-medium'>{t('Enable Direct Messages')}</h3>
            {dmsEnabled === null ? (
              <Spinner className='m-0 mr-1' />
            ) : (
              <CheckboxToggle checked={dmsEnabled} onChange={toggleDms} />
            )}
          </div>

          {currentChannel?.isAdmin ? (
            <div className='mx-auto max-w-[30rem] flex justify-between items-center mb-9'>
              <h3 className='text-sm font-medium'>{t('Export Admin Keys')}</h3>
              <Keys
                className='cursor-pointer text-primary w-6 h-6 hover:text-primary-dark'
                onClick={() => {
                  setModalView('EXPORT_ADMIN_KEYS');
                  openModal();
                }}
              />
            </div>
          ) : (
            <div className='mx-auto max-w-[30rem] flex justify-between items-center mb-9'>
              <h3 className='text-sm font-medium'>{t('Claim Admin Keys')}</h3>
              <LockOpen
                className='cursor-pointer text-primary w-6 h-6 hover:text-primary-dark'
                onClick={() => {
                  setModalView('CLAIM_ADMIN_KEYS');
                  openModal();
                }}
              />
            </div>
          )}

          <div className='mx-auto max-w-[30rem] flex justify-between items-center mb-9'>
            <h3 className='text-sm font-medium'>{t('Notifications')}</h3>
            <select
              onChange={onNotificationStatusChange}
              value={notificationStatus}
              id='notification-levels'
              className='bg-dark-2 px-4 py-2 rounded border-none outline-none text-sm'
            >
              <option value={NotificationStatus.WhenOpen}>When Open</option>
              <option value={NotificationStatus.All}>All</option>
              <option value={NotificationStatus.Mute}>Mute</option>
            </select>
          </div>

          <div className='mx-auto max-w-[30rem] flex justify-between items-center mb-9'>
            <h3 className='text-sm font-medium'>{t('Notification Level')}</h3>
            <select
              onChange={onNotificationLevelChange}
              value={notificationLevel}
              id='notification-levels'
              className='bg-dark-2 px-4 py-2 rounded border-none outline-none text-sm'
            >
              <option value={ChannelNotificationLevel.NotifyAll}>All</option>
              <option value={ChannelNotificationLevel.NotifyPing}>Tags, replies, and pins</option>
              <option value={ChannelNotificationLevel.NotifyNone}>None</option>
            </select>
          </div>

          <div className='mx-auto max-w-[30rem] flex justify-between items-center mb-9'>
            <h3 className='text-sm font-medium'>{t('Leave Channel')}</h3>
            <RightFromBracket
              className='cursor-pointer text-primary w-6 h-6 hover:text-primary-dark'
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
