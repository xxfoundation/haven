import { AdminKeysUpdateEvent, ChannelStatus, ChannelUpdateEvent, DMBlockedUserEvent, DMNotificationsUpdateEvent, MessageDeletedEvent, MessageStatus, NicknameUpdatedEvent, NotificationUpdateEvent, UserMutedEvent } from '@types';
import { useCallback } from 'react';

import * as channels from 'src/store/channels'
import * as messages from 'src/store/messages';
import { useAppDispatch } from 'src/store/hooks';
import useNotification from './useNotification';
import { useNetworkClient } from '@contexts/network-client-context';
import { Message } from 'src/types';
import { AppEvents, ChannelEvents, DMEvents, appBus, useAppEventListener, useChannelsListener, useDmListener } from 'src/events';
import * as dms from 'src/store/dms';

const useEvents = () => {
  const { fetchChannels } = useNetworkClient();
  const dispatch = useAppDispatch();

  const onNicknameUpdate = useCallback((e: NicknameUpdatedEvent) => {
    dispatch(channels.actions.updateNickname({
      channelId: e.channelId,
      nickname: e.exists ? e.nickname : undefined
    }));
  }, [dispatch]);


  const onMessageDeleted = useCallback((evt: MessageDeletedEvent) => {
    dispatch(messages.actions.delete(evt.messageId));
  }, [dispatch]);


  const onUserMuted = useCallback((evt: UserMutedEvent) => {
    dispatch(channels.actions.updateMuted(evt));
  }, [dispatch]);

  
  const onAdminKeysUpdate = useCallback((evt: AdminKeysUpdateEvent) => {
    dispatch(channels.actions.updateAdmin(evt))
  }, [dispatch]);

  const onNotificationUpdate = useCallback((evt: NotificationUpdateEvent) => {
    evt.changedNotificationStates?.forEach((state) => {
      dispatch(channels.actions.updateNotificationLevel(state));
      dispatch(channels.actions.updateNotificationStatus(state));
    });

    evt.deletedNotificationStates?.forEach((channelId) => {
      dispatch(channels.actions.updateNotificationLevel({ channelId }));
      dispatch(channels.actions.updateNotificationStatus({ channelId }));
    });
  }, [dispatch]);

  const onChannelUpdate = useCallback((evt: ChannelUpdateEvent[]) => {
    evt.forEach(async (e) => {
      dispatch(channels.actions.updateDmsEnabled({
        channelId: e.channelId,
        enabled: e.tokenEnabled
      }));

      if (e.status === ChannelStatus.SYNC_DELETED) {
        dispatch(channels.actions.leaveChannel(e.channelId));
      }

      if (e.status === ChannelStatus.SYNC_CREATED) {
        fetchChannels();
      }
    });
  }, [dispatch, fetchChannels])

  useChannelsListener(ChannelEvents.NICKNAME_UPDATE, onNicknameUpdate);
  useChannelsListener(ChannelEvents.MESSAGE_DELETED, onMessageDeleted);
  useChannelsListener(ChannelEvents.USER_MUTED, onUserMuted);
  useChannelsListener(ChannelEvents.ADMIN_KEY_UPDATE, onAdminKeysUpdate);
  useChannelsListener(ChannelEvents.NOTIFICATION_UPDATE, onNotificationUpdate);
  useChannelsListener(ChannelEvents.CHANNEL_UPDATE, onChannelUpdate);
  
  const onMessageProcessed = useCallback(async (message: Message, oldMessage?: Message) => {
    if (!oldMessage || oldMessage.status !== MessageStatus.Delivered) {
      return;
    }

    try {
      if (!oldMessage?.pinned && message?.pinned) {
        appBus.emit(AppEvents.MESSAGE_PINNED, message);
      }

      if (oldMessage?.pinned && !message.pinned) {
        appBus.emit(AppEvents.MESSAGE_UNPINNED, message);
      }
    } catch (e) {
      console.error('Error awaiting message processing for pin notification', e);
    }
  }, [])

  useAppEventListener(AppEvents.MESSAGE_PROCESSED, onMessageProcessed);

  const { notifyMentions, notifyPinned, notifyReplies } = useNotification();

  useAppEventListener(AppEvents.MESSAGE_PROCESSED, notifyMentions);
  useAppEventListener(AppEvents.MESSAGE_PROCESSED, notifyReplies);
  useAppEventListener(AppEvents.MESSAGE_PINNED, notifyPinned);

  const updateDmNotifications = useCallback((e: DMNotificationsUpdateEvent) => {
    e.changedNotificationStates.forEach((state) => {
      dispatch(dms.actions.upsertNotificationLevel(state));
    });

    e.deletedNotificationStates.forEach((pubkey) => {
      dispatch(dms.actions.upsertNotificationLevel({ pubkey }));
    })
  }, [dispatch]);

  const onUserBlockUpdate = useCallback((evt: DMBlockedUserEvent) => {
    if (evt.blocked) {
      dispatch(dms.actions.blockUser(evt.pubkey));
    } else {
      dispatch(dms.actions.unblockUser(evt.pubkey));
    }
  }, [dispatch]);



  useDmListener(DMEvents.DM_NOTIFICATION_UPDATE, updateDmNotifications);
  useDmListener(DMEvents.DM_BLOCKED_USER, onUserBlockUpdate);
}

export default useEvents;
