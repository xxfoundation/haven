import icon from 'src/assets/images/logo.svg';
import { useRef, useCallback } from 'react';
import { useLocalStorage, useSessionStorage } from 'usehooks-ts';
import useSound from 'use-sound';
import { convert } from 'html-to-text';

import { inflate } from '@utils/index';
import { ChannelId, DBMessage, Message, MessageStatus, MessageType, ChannelNotificationLevel, NotificationStatus, DMNotificationLevel } from '@types';
import { useAppSelector } from 'src/store/hooks';
import * as identity from 'src/store/identity';
import { useUtils } from '@contexts/utils-context';
import { useDb } from '@contexts/db-context';
import * as channels from 'src/store/channels';
import * as dms from 'src/store/dms';
import { AppEvents, useAppEventListener } from 'src/events';

const getText = (content: string) => {
  let text = ''; 
  try {
    text = convert(inflate(content));
  } catch (e) {
    text = content;
  }
  return text;
}

const useNotification = () => {
  const { getCodeNameAndColor } = useUtils();
  const db = useDb('channels');
  const [notificationSound] = useLocalStorage('notification-sound', '/sounds/notification.mp3');
  const [playNotification] = useSound(notificationSound);
  const [isPermissionGranted, setIsPermissionGranted] = useLocalStorage<boolean>('notification-permission', Notification?.permission === 'granted');
  const notification = useRef<Notification | null>(null);
  const [permissionIgnored, setPermissionIgnored] = useSessionStorage('notifications_ignored', false);
  const userIdentity = useAppSelector(identity.selectors.identity);
  const notify = useCallback((title: string, options?: NotificationOptions) => {
    if (isPermissionGranted) {
      notification.current = new Notification(title, options);
      playNotification();
    }
  }, [isPermissionGranted, playNotification]);
  const allChannels = useAppSelector(channels.selectors.channels);
  const channelNotificationLevels = useAppSelector(channels.selectors.notificationLevels);
  const notificationStatuses = useAppSelector(channels.selectors.notificationStatuses);
  const dmNotificationLevels = useAppSelector(dms.selectors.allNotificationLevels);

  const messageReplied = useCallback((username: string, message: string) => {
    notify(`${username} replied to you`, {
      body: getText(message),
      icon
    });
  }, [notify]);

  const notifyMentioned = useCallback((username: string, message: string) => {
    notify(`${username} mentioned you`, {
      body: getText(message),
      icon
    });
  }, [notify]);

  const messagePinned = useCallback((message: string, channelName: string) => {
    notify(`New message pinned in ${channelName}`, { icon, body: getText(message) });
  }, [notify]);

  const close = useCallback(() => {
    notification.current?.close();
  }, []);

  const request = useCallback(() => {
    Notification.requestPermission()
      .then((permission) => setIsPermissionGranted(permission === 'granted'));
  }, [setIsPermissionGranted]);

  const dmReceived = useCallback((username: string, message: string) => {
    notify(`${username} just sent you a direct message`, { icon, body: getText(message) });
  }, [notify]);

  const onDmProcessed = useCallback((msg: Message) => {
    if (dmNotificationLevels[msg.pubkey] === DMNotificationLevel.NotifyAll) {
      dmReceived(msg.nickname || msg.codename, msg.body);
    }
  }, [dmNotificationLevels, dmReceived]);

  useAppEventListener(AppEvents.DM_PROCESSED, onDmProcessed);

  const isUserPingableOnThisChannel = useCallback((channelId: ChannelId) => {
    const level = channelNotificationLevels[channelId] ?? ChannelNotificationLevel.NotifyPing;
    const status = notificationStatuses[channelId] ?? NotificationStatus.WhenOpen;
    return level >= ChannelNotificationLevel.NotifyPing && status >= NotificationStatus.Mute;
  }, [channelNotificationLevels, notificationStatuses])

  const notifyMentions = useCallback((message: Message) => {
    const canNotify = isUserPingableOnThisChannel(message.channelId);

    if (message.status === MessageStatus.Delivered && canNotify) {
      const inflatedText = inflate(message.body);
      const mentions = new DOMParser()
        .parseFromString(inflatedText, 'text/html')
        .getElementsByClassName('mention');

      for (let i = 0; i < mentions.length; i++) {
        const mention = mentions[i];
        const mentionedPubkey = mention.getAttribute('data-id');

        if (mentionedPubkey === userIdentity?.pubkey) {
          const { codename } = getCodeNameAndColor(message.pubkey, message.codeset);
          notifyMentioned(
            message.nickname || codename,
            message.body
          );
          break;
        }
      }
    }
  }, [getCodeNameAndColor, isUserPingableOnThisChannel, notifyMentioned, userIdentity?.pubkey]);

  const notifyReplies = useCallback(async (message: Message) => {
    if (
      db 
      && message.type !== MessageType.Reaction // Remove emoji reactions, Ben thinks theyre annoying
      && message.repliedTo !== null
      && message.pubkey !== userIdentity?.pubkey
    ) {
      const replyingTo = await db.table<DBMessage>('messages')
        .where('message_id')
        .equals(message?.repliedTo)
        .first();
      if (replyingTo && replyingTo?.pubkey === userIdentity?.pubkey) {
        const canNotify = isUserPingableOnThisChannel(replyingTo.channel_id);
        if (canNotify) {
          const { codename } = getCodeNameAndColor(message.pubkey, message.codeset);
          messageReplied(
            message.nickname || codename,
            message.body
          )
        }
      }
    }
  }, [db, getCodeNameAndColor, isUserPingableOnThisChannel, messageReplied, userIdentity?.pubkey]);

  const notifyPinned = useCallback((message: Message) => {
    const channel = allChannels.find((c) => c.id === message.channelId);
    const canNotify = isUserPingableOnThisChannel(message.channelId);

    if (channel && canNotify) {
      messagePinned(message.body, channel.name);
    }
  }, [allChannels, isUserPingableOnThisChannel, messagePinned]);

  return {
    isPermissionGranted,
    permissionIgnored,
    setPermissionIgnored,
    setIsPermissionGranted,
    close,
    request,
    notifyPinned,
    notifyReplies,
    notifyMentions
  };
};

export default useNotification;