import type { AdminKeysUpdateEvent, MessageDeletedEvent, MessagePinEvent, NicknameUpdatedEvent, UserMutedEvent } from '@types';
import { useEffect } from 'react';

import * as channels from 'src/store/channels'
import * as messages from 'src/store/messages';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { AppEvents, ChannelEvents, bus } from 'src/events';
import useNotification from './useNotification';

const useEvents = () => {
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
  }, [dispatch])
}

export default useEvents;
