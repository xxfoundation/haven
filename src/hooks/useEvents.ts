import { AdminKeysUpdateEvent, ChannelStatus, ChannelUpdateEvent, MessageDeletedEvent, MessagePinEvent, NicknameUpdatedEvent, NotificationUpdateEvent, UserMutedEvent } from '@types';
import { useEffect } from 'react';

import * as channels from 'src/store/channels'
import * as messages from 'src/store/messages';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { AppEvents, ChannelEvents, bus } from 'src/events';
import useNotification from './useNotification';
import { useNetworkClient } from '@contexts/network-client-context';

const useEvents = () => {
  const { fetchChannels } = useNetworkClient();
  const currentChannels = useAppSelector(channels.selectors.channels);
  const { messagePinned } = useNotification();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handler = (e: NicknameUpdatedEvent) => {
      dispatch(channels.actions.updateNickname({
        channelId: e.channelId,
        nickname: e.exists ? e.nickname : undefined
      }));
    }

    bus.addListener(ChannelEvents.NICKNAME_UPDATE, handler);

    return () => { bus.removeListener(ChannelEvents.NICKNAME_UPDATE, handler)};
  }, [dispatch]);

  useEffect(() => {
    const listener = (evt: MessageDeletedEvent) => {
      dispatch(messages.actions.delete(evt.messageId));
    };

    bus.addListener(ChannelEvents.MESSAGE_DELETED, listener);

    return () => { bus.removeListener(ChannelEvents.MESSAGE_DELETED, listener); }
  }, [dispatch]);

  useEffect(() => {
    const listener = ({ body, channelId }: MessagePinEvent) => {
      const channelName = currentChannels.find((c) => c.id === channelId)?.name ?? 'unknown';
      messagePinned(body, channelName);
    };

    bus.addListener(AppEvents.MESSAGE_PINNED, listener);

    return () => { bus.removeListener(AppEvents.MESSAGE_PINNED, listener); }

  }, [currentChannels, messagePinned]);

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

        if ([ChannelStatus.SYNC_DELETED].includes(e.status)) {
          channels.actions.leaveChannel(e.channelId);
        }

        if (e.status === ChannelStatus.SYNC_CREATED) {
          fetchChannels();
        }
      });
    }

    bus.addListener(ChannelEvents.CHANNEL_UPDATE, listener);

    return () => { bus.removeListener(ChannelEvents.CHANNEL_UPDATE, listener); }
  }, [dispatch, fetchChannels])
}

export default useEvents;
