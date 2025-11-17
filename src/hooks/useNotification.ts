import icon from 'src/assets/images/logo.svg';
import { useRef, useCallback, useState, useEffect } from 'react';
import { useSessionStorage } from 'usehooks-ts';
import { useAppSelector } from 'src/store/hooks';
import * as identity from 'src/store/identity';
import { useUtils } from '@contexts/utils-context';
import { useDb } from '@contexts/db-context';
import * as channels from 'src/store/channels';
import * as dms from 'src/store/dms';
import { AppEvents, useAppEventListener } from 'src/events';
import { EasterEggs, useUI } from '@contexts/ui-context';
import { useNetworkClient } from '@contexts/network-client-context';
import useLocalStorage from './useLocalStorage';
import { useRemotelySynchedString } from './useRemotelySynchedValue';
import { DMNotificationLevel } from 'src/types/events';
import {
  Message,
  ChannelId,
  ChannelNotificationLevel,
  NotificationStatus,
  MessageStatus,
  MessageType,
  DBMessage
} from 'src/types';
import { useSound } from 'src/contexts/sound-context';

const useNotification = () => {
  const { getCodeNameAndColor } = useUtils();
  const { triggerEasterEgg } = useUI();
  const { setNickname } = useNetworkClient();
  const db = useDb('channels');
  const { value: notificationSound } = useRemotelySynchedString(
    'notification-sound',
    '/sounds/notification.mp3'
  );
  const { value: enableSounds, set: setEnableSounds } = useRemotelySynchedString('enable-notification-sounds', 'true');
  const { value: notifyOnDMs, set: setNotifyOnDMs } = useRemotelySynchedString('notify-on-dms', 'true');
  const { value: notifyOnMentions, set: setNotifyOnMentions } = useRemotelySynchedString('notify-on-mentions', 'true');
  const { value: notifyOnReplies, set: setNotifyOnReplies } = useRemotelySynchedString('notify-on-replies', 'true');
  const { value: notifyOnPins, set: setNotifyOnPins } = useRemotelySynchedString('notify-on-pins', 'true');
  const { playNotification } = useSound();
  const [isPermissionGranted, setIsPermissionGranted] = useLocalStorage<boolean>(
    'notifications-enabled',
    Notification?.permission === 'granted'
  );

  // DEBUG: Log notification settings
  useEffect(() => {
    console.log('[DEBUG] Notification Settings:', {
      enableSounds,
      notifyOnPins,
      notifyOnMentions,
      notifyOnReplies,
      notifyOnDMs,
      notificationSound,
      playNotification: playNotification ? 'function exists' : 'null',
      isPermissionGranted
    });
  }, [enableSounds, notifyOnPins, notifyOnMentions, notifyOnReplies, notifyOnDMs, notificationSound, playNotification, isPermissionGranted]);

  // Sync permission on mount if browser state has changed
  useEffect(() => {
    if (Notification && Notification.permission === 'granted' && !isPermissionGranted) {
      setIsPermissionGranted(true);
    } else if (Notification && Notification.permission === 'denied' && isPermissionGranted) {
      setIsPermissionGranted(false);
    }
  }, []); // Run once on mount
  const notification = useRef<Notification | null>(null);
  const [permissionIgnored, setPermissionIgnored] = useSessionStorage(
    'notifications_ignored',
    false
  );
  const userIdentity = useAppSelector(identity.selectors.identity);

  const notify = useCallback(
    (title: string, options?: NotificationOptions) => {
      console.log('[DEBUG] notify() called:', { 
        title, 
        enableSounds, 
        enableSoundsType: typeof enableSounds,
        playNotification: playNotification ? 'function exists' : 'null',
        isPermissionGranted 
      });
      
      if (enableSounds === 'true') {
        console.log('[DEBUG] enableSounds is true, checking playNotification...');
        if (playNotification) {
          console.log('[DEBUG] Playing notification sound!');
          playNotification();
        } else {
          console.log('[DEBUG] playNotification is null, sound not played');
        }
      } else {
        console.log('[DEBUG] enableSounds is NOT true:', enableSounds);
      }
      
      if (isPermissionGranted) {
        if (notificationSound?.includes('augh')) {
          triggerEasterEgg(EasterEggs.Masochist);
          setNickname('Masochist');
        }
        notification.current = new Notification(title, options);
      }
    },
    [isPermissionGranted, notificationSound, playNotification, setNickname, triggerEasterEgg, enableSounds]
  );

  const allChannels = useAppSelector(channels.selectors.channels);
  const channelNotificationLevels = useAppSelector(channels.selectors.notificationLevels);
  const notificationStatuses = useAppSelector(channels.selectors.notificationStatuses);
  const dmNotificationLevels = useAppSelector(dms.selectors.allNotificationLevels);

  const messageReplied = useCallback(
    (username: string, message: string) => {
      notify(`${username} replied to you`, {
        body: message,
        icon
      });
    },
    [notify]
  );

  const notifyMentioned = useCallback(
    (username: string, message: string) => {
      notify(`${username} mentioned you`, {
        body: message,
        icon
      });
    },
    [notify]
  );

  const messagePinned = useCallback(
    (message: string, channelName: string) => {
      notify(`New message pinned in ${channelName}`, { icon, body: message });
    },
    [notify]
  );

  const close = useCallback(() => {
    notification.current?.close();
  }, []);

  const request = useCallback(() => {
    Notification.requestPermission().then((permission) =>
      setIsPermissionGranted(permission === 'granted')
    );
  }, [setIsPermissionGranted]);

  const dmReceived = useCallback(
    (username: string, message: string) => {
      notify(`${username} just sent you a direct message`, { icon, body: message });
    },
    [notify]
  );

  const onDmProcessed = useCallback(
    (msg: Message) => {
      if (notifyOnDMs === 'true' && dmNotificationLevels[msg.pubkey] === DMNotificationLevel.NotifyAll) {
        dmReceived(msg.nickname || msg.codename, msg.plaintext ?? '');
      }
    },
    [notifyOnDMs, dmNotificationLevels, dmReceived]
  );

  useAppEventListener(AppEvents.DM_PROCESSED, onDmProcessed);

  const isUserPingableOnThisChannel = useCallback(
    (channelId: ChannelId) => {
      const level = channelNotificationLevels[channelId] ?? ChannelNotificationLevel.NotifyPing;
      const status = notificationStatuses[channelId] ?? NotificationStatus.WhenOpen;
      return level >= ChannelNotificationLevel.NotifyPing && status >= NotificationStatus.Mute;
    },
    [channelNotificationLevels, notificationStatuses]
  );

  const notifyMentions = useCallback(
    (message: Message) => {
      if (notifyOnMentions !== 'true') return;
      
      const canNotify = isUserPingableOnThisChannel(message.channelId);

      if (message.status === MessageStatus.Delivered && canNotify) {
        const mentions = new DOMParser()
          .parseFromString(message.body, 'text/html')
          .getElementsByClassName('mention');

        for (let i = 0; i < mentions.length; i++) {
          const mention = mentions[i];
          const mentionedPubkey = mention.getAttribute('data-id');

          if (mentionedPubkey === userIdentity?.pubkey) {
            const { codename } = getCodeNameAndColor(message.pubkey, message.codeset);
            notifyMentioned(message.nickname || codename, message.plaintext ?? '');
            break;
          }
        }
      }
    },
    [notifyOnMentions, getCodeNameAndColor, isUserPingableOnThisChannel, notifyMentioned, userIdentity?.pubkey]
  );

  const notifyReplies = useCallback(
    async (message: Message) => {
      if (notifyOnReplies !== 'true') return;
      
      if (
        db &&
        message.type !== MessageType.Reaction && // Remove emoji reactions, Ben thinks theyre annoying
        message.repliedTo !== null &&
        message.pubkey !== userIdentity?.pubkey
      ) {
        const replyingTo = await db
          .table<DBMessage>('messages')
          .where('message_id')
          .equals(message?.repliedTo)
          .first();
        if (replyingTo && replyingTo?.pubkey === userIdentity?.pubkey) {
          const canNotify = isUserPingableOnThisChannel(replyingTo.channel_id);
          if (canNotify) {
            const { codename } = getCodeNameAndColor(message.pubkey, message.codeset);
            messageReplied(message.nickname || codename, message.plaintext ?? '');
          }
        }
      }
    },
    [notifyOnReplies, db, getCodeNameAndColor, isUserPingableOnThisChannel, messageReplied, userIdentity?.pubkey]
  );

  const notifyPinned = useCallback(
    (message: Message) => {
      console.log('[DEBUG] notifyPinned() called:', { 
        notifyOnPins, 
        notifyOnPinsType: typeof notifyOnPins,
        messageId: message.id,
        channelId: message.channelId 
      });
      
      if (notifyOnPins !== 'true') {
        console.log('[DEBUG] notifyOnPins is NOT true, returning early:', notifyOnPins);
        return;
      }
      
      const channel = allChannels.find((c) => c.id === message.channelId);
      console.log('[DEBUG] Channel found:', channel ? channel.name : 'null');
      
      // For pinned messages, only check if the channel is not completely muted
      // Pinned messages are important admin announcements and should bypass the notification level setting
      const status = notificationStatuses[message.channelId] ?? NotificationStatus.WhenOpen;
      const canNotify = status !== NotificationStatus.Mute;
      console.log('[DEBUG] Can notify?', { status, canNotify });

      if (channel && canNotify) {
        console.log('[DEBUG] Calling messagePinned()');
        messagePinned(message.plaintext ?? '', channel.name);
      } else {
        console.log('[DEBUG] NOT calling messagePinned - channel or canNotify failed');
      }
    },
    [notifyOnPins, allChannels, notificationStatuses, messagePinned]
  );

  return {
    isPermissionGranted: !!isPermissionGranted,
    permissionIgnored,
    setPermissionIgnored,
    setIsPermissionGranted,
    close,
    request,
    notifyPinned,
    notifyReplies,
    notifyMentions,
    enableSounds: enableSounds === 'true',
    setEnableSounds: (val: boolean) => setEnableSounds(val ? 'true' : 'false'),
    notifyOnDMs: notifyOnDMs === 'true',
    setNotifyOnDMs: (val: boolean) => setNotifyOnDMs(val ? 'true' : 'false'),
    notifyOnMentions: notifyOnMentions === 'true',
    setNotifyOnMentions: (val: boolean) => setNotifyOnMentions(val ? 'true' : 'false'),
    notifyOnReplies: notifyOnReplies === 'true',
    setNotifyOnReplies: (val: boolean) => setNotifyOnReplies(val ? 'true' : 'false'),
    notifyOnPins: notifyOnPins === 'true',
    setNotifyOnPins: (val: boolean) => setNotifyOnPins(val ? 'true' : 'false')
  };
};

export default useNotification;
