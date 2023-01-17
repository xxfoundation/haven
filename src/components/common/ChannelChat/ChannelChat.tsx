import type { Message } from 'src/types';

import { FC, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import cn from 'classnames';
import { debounce } from 'lodash';

import UserTextArea from './UserTextArea/UserTextArea';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { Tree } from 'src/components/icons';

import s from './ChannelChat.module.scss';
import MessagesContainer from './MessagesContainer';
import PinnedMessage from './PinnedMessage';
import { useUI } from '@contexts/ui-context';
import ChannelHeader from '../ChannelHeader';

type Props = {
  messages: Message[];
  isPinnedMessages?: boolean;
}

const ChannelChat: FC<Props> = ({ messages }) => {
  const { openModal, setModalView } = useUI();
  const {
    channels,
    cmix,
    currentChannel,
    loadMoreChannelData,
    sendReaction
  } = useNetworkClient();
  const debouncedDataLoader = useMemo(() => debounce(loadMoreChannelData, 1000), [loadMoreChannelData]);
  const messagesContainerRef = useRef<HTMLDivElement>(null); 
  const [replyToMessage, setReplyToMessage] = useState<Message | null>();
  const [autoScrollToEnd, setAutoScrollToEnd] = useState<boolean>(true);
  const [messageBody, setMessageBody] = useState<string>('');

  const currentChannelMessages = useMemo(
    () => messages.filter(m =>  m.channelId === currentChannel?.id),
    [currentChannel?.id, messages]
  );

  useEffect(() => {
    setReplyToMessage(undefined);
  }, [currentChannel?.id]);

  const checkBottom = useCallback(() => {
    if (messagesContainerRef && messagesContainerRef.current) {
      const { clientHeight, scrollHeight, scrollTop } = messagesContainerRef.current;
      return (
        Math.ceil(scrollTop + clientHeight) >= scrollHeight
      );
    }
    return;
  }, []);

  const checkTop = useCallback(async () => {
    if (
      currentChannel &&
      typeof currentChannel.currentMessagesBatch !== 'undefined'
    ) {
      
      await debouncedDataLoader(currentChannel.id);

      if (
        messagesContainerRef &&
        messagesContainerRef.current &&
        messagesContainerRef.current.scrollTop === 0
      ) {
        messagesContainerRef.current.scrollTop = 20;
      }
    }
  }, [currentChannel, debouncedDataLoader]);

  const scrollToEnd = useCallback(() => {
    if (messagesContainerRef && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
    setAutoScrollToEnd(true);
  }, []);

  useEffect(() => {
    if (autoScrollToEnd) {
      scrollToEnd();
    }
  }, [autoScrollToEnd, scrollToEnd, messages, currentChannel]);


  const onEmojiReaction = useCallback((emoji: string, messageId: string) =>  {
    if (cmix && cmix.ReadyToSend && !cmix.ReadyToSend()) {
      setModalView('NETWORK_NOT_READY');
      openModal();
    } else {
      sendReaction(emoji, messageId);
    }
  }, [cmix, openModal, sendReaction, setModalView]);

  return (
    <div className={s.root}>
      {currentChannel ? (
        <>
          <ChannelHeader {...currentChannel} />
          <PinnedMessage 
            handleReplyToMessage={setReplyToMessage}
            onEmojiReaction={onEmojiReaction}
          />
          <MessagesContainer
            id={'messagesContainer'}
            className={cn(s.messagesContainer)}
            scrollRef={messagesContainerRef}
            onEmojiReaction={onEmojiReaction}
            onScroll={() => {
              checkTop();
              if (checkBottom()) {
                setAutoScrollToEnd(true);
              } else {
                setAutoScrollToEnd(false);
              }
            }}
            messages={currentChannelMessages}
            handleReplyToMessage={setReplyToMessage} />
          <UserTextArea
            messageBody={messageBody}
            setMessageBody={setMessageBody}
            scrollToEnd={() => setAutoScrollToEnd(true)}
            replyToMessage={replyToMessage}
            setReplyToMessage={setReplyToMessage}
          />
        </>
      ) : channels.length ? (
        <div className={s.channelHeader}></div>
      ) : (
        <>
          <div className={s.channelHeader}></div>
          <div className='flex flex-col justify-center items-center h-full'>
            <Tree></Tree>
            <div
              style={{
                fontSize: '12px',
                lineHeight: '14px',
                marginTop: '14px',
                maxWidth: '280px',
                fontWeight: '700',
                color: 'var(--text-primary)'
              }}
            >
              You haven't joined any channel yet. You can create or join a
              channel to start the journey!
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChannelChat;
