import { AdminKeysUpdateEvent, ChannelStatus, ChannelUpdateEvent, MessageDeletedEvent, MessageStatus, NicknameUpdatedEvent, NotificationUpdateEvent, UserMutedEvent } from '@types';
import { useEffect } from 'react';

import * as channels from 'src/store/channels'
import * as messages from 'src/store/messages';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { AppEvents, ChannelEvents, bus } from 'src/events';
import useNotification from './useNotification';
import { useNetworkClient } from '@contexts/network-client-context';
import { messagesByChannelId } from 'src/store/messages/selectors';
import { Message } from 'src/types';

const useEvents = () => {
  const { fetchChannels } = useNetworkClient();
  const allMessagesByChannelId = useAppSelector(messagesByChannelId);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const nicknameUpdateHandler = (e: NicknameUpdatedEvent) => {
      dispatch(channels.actions.updateNickname({
        channelId: e.channelId,
        nickname: e.exists ? e.nickname : undefined
      }));
    }

    bus.addListener(ChannelEvents.NICKNAME_UPDATE, nicknameUpdateHandler);

    return () => { bus.removeListener(ChannelEvents.NICKNAME_UPDATE, nicknameUpdateHandler)};
  }, [dispatch]);

  useEffect(() => {
    const listener = (evt: MessageDeletedEvent) => {
      dispatch(messages.actions.delete(evt.messageId));
    };

    bus.addListener(ChannelEvents.MESSAGE_DELETED, listener);

    return () => { bus.removeListener(ChannelEvents.MESSAGE_DELETED, listener); }
  }, [dispatch]);

  useEffect(() => {
    const listener = (evt: UserMutedEvent) => {
      dispatch(channels.actions.updateMuted(evt));
    }

    bus.addListener(ChannelEvents.USER_MUTED, listener);

    return () => { bus.removeListener(ChannelEvents.USER_MUTED, listener); };
  }, [dispatch]);

  useEffect(() => {
    const listener = (evt: AdminKeysUpdateEvent) => {
      dispatch(channels.actions.updateAdmin(evt))
    }

    bus.addListener(ChannelEvents.ADMIN_KEY_UPDATE, listener);

    return () => {
      bus.removeListener(ChannelEvents.ADMIN_KEY_UPDATE, listener);
    }
  }, [dispatch]);

  useEffect(() => {
    const listener = (evt: NotificationUpdateEvent) => {
      evt.changedNotificationStates.forEach((state) => {
        dispatch(channels.actions.updateNotificationLevel(state));
        dispatch(channels.actions.updateNotificationStatus(state));
      });

      evt.deletedNotificationStates?.forEach((channelId) => {
        dispatch(channels.actions.updateNotificationLevel({ channelId }));
        dispatch(channels.actions.updateNotificationStatus({ channelId }));
      });
    }

    bus.addListener(ChannelEvents.NOTIFICATION_UPDATE, listener);

    return () => { bus.removeListener(ChannelEvents.NOTIFICATION_UPDATE, listener); }
  }, [dispatch]);

  useEffect(() => {
    const listener = (evt: ChannelUpdateEvent[]) => {
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
    }

    bus.addListener(ChannelEvents.CHANNEL_UPDATE, listener);

    return () => { bus.removeListener(ChannelEvents.CHANNEL_UPDATE, listener); }
  }, [dispatch, fetchChannels]);

  useEffect(() => {
    const emitPinEvents = async (message: Message, oldMessage?: Message) => {
      if (!oldMessage || oldMessage.status !== MessageStatus.Delivered) {
        return;
      }

      try {
        if (!oldMessage?.pinned && message?.pinned) {
          bus.emit(AppEvents.MESSAGE_PINNED, message);
        }
  
        if (oldMessage?.pinned && !message.pinned) {
          bus.emit(AppEvents.MESSAGE_UNPINNED, message);
        }
      } catch (e) {
        console.error('Error awaiting message processing for pin notification', e);
      }
    }

    bus.addListener(AppEvents.MESSAGE_PROCESSED, emitPinEvents);

    return () => { bus.removeListener(AppEvents.MESSAGE_PROCESSED, emitPinEvents); }
  }, [allMessagesByChannelId]);

  const { notifyMentions, notifyPinned, notifyReplies } = useNotification();

  useEffect(() => {
    bus.addListener(AppEvents.MESSAGE_PROCESSED, notifyMentions);
    bus.addListener(AppEvents.MESSAGE_PROCESSED, notifyReplies);
    bus.addListener(AppEvents.MESSAGE_PINNED, notifyPinned);

    return () => {
      bus.removeListener(AppEvents.MESSAGE_PROCESSED, notifyMentions);
      bus.removeListener(AppEvents.MESSAGE_PROCESSED, notifyReplies);
      bus.removeListener(AppEvents.MESSAGE_PINNED, notifyPinned);
    };
  }, [notifyMentions, notifyPinned, notifyReplies])
}

export default useEvents;
