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
import * as channels from 'src/store/channels';
import { useAppSelector } from 'src/store/hooks';
import Spinner from '../Spinner';

type Props = {
  messages: Message[];
  isPinnedMessages?: boolean;
}

const ChannelChat: FC<Props> = ({ messages }) => {
  const { openModal, setModalView } = useUI();
  const {
    cmix,
    pagination,
    sendReaction
  } = useNetworkClient();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>();
  const [autoScrollToEnd, setAutoScrollToEnd] = useState<boolean>(true);
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const joinedChannels = useAppSelector(channels.selectors.channels);
  const paginatedItems = useMemo(() => pagination.paginate(messages), [messages, pagination]);
  
  useEffect(() => {
    setReplyToMessage(undefined);
  }, [currentChannel?.id]);
  
  const userIsAtTop = useCallback(() =>
    messagesContainerRef &&
    messagesContainerRef.current &&
    messagesContainerRef.current.scrollTop === 0,
    []
  );

  useEffect(() => {
    pagination.setCount(messages.length);
  }, [messages.length, pagination])

  const checkIfUserScrolledTop = useCallback(() => {
    if (pagination.hasMore && messagesContainerRef.current && userIsAtTop()) {
      messagesContainerRef.current.scrollTop = 45;
      pagination.next();
    }
  }, [pagination, userIsAtTop]);

  const scrollToEnd = useCallback(() => {
    if (messagesContainerRef && messagesContainerRef.current) {
      const newScrollTop = messagesContainerRef.current.scrollHeight - messagesContainerRef.current.offsetHeight - (pagination.hasLess ? 45 : 0);
      messagesContainerRef.current.scrollTop =  newScrollTop;
    }
    setAutoScrollToEnd(true);
  }, [pagination.hasLess]);


  const checkIfUserScrolledToBottom = useCallback(() => {
    if (messagesContainerRef && messagesContainerRef.current) {
      const { clientHeight, scrollHeight, scrollTop } = messagesContainerRef.current;
   
      if (pagination.hasLess && Math.floor(scrollHeight - scrollTop) <= (clientHeight + 1)) {
        messagesContainerRef.current.scrollBy(0, -45);
        pagination.previous();
      }
    }
  }, [pagination]);

  useEffect(() => {
    if (autoScrollToEnd) {
      scrollToEnd();
    }
  }, [autoScrollToEnd, scrollToEnd, currentChannel]);


  const onEmojiReaction = useCallback((emoji: string, messageId: string) =>  {
    if (cmix && cmix.ReadyToSend && !cmix.ReadyToSend()) {
      setModalView('NETWORK_NOT_READY');
      openModal();
    } else {
      sendReaction(emoji, messageId);
    }
  }, [cmix, openModal, sendReaction, setModalView]);

  const onScroll = useMemo(() => debounce(() => {
    checkIfUserScrolledTop();
    checkIfUserScrolledToBottom();
  }, 10), [checkIfUserScrolledTop, checkIfUserScrolledToBottom])

  return (
    <div className={s.root}>
      {currentChannel ? (
        <>
          <ChannelHeader {...currentChannel} />
          <PinnedMessage 
            handleReplyToMessage={setReplyToMessage}
            onEmojiReaction={onEmojiReaction}
          />
          <div style={{ overflow: 'auto', flexGrow: 1, overflowAnchor: 'none' }} onScroll={onScroll} ref={messagesContainerRef}>
            {pagination.hasMore && <Spinner />}
            <MessagesContainer
              id={'messagesContainer'}
              className={cn(s.messagesContainer)}
              onEmojiReaction={onEmojiReaction}
              messages={paginatedItems}
              handleReplyToMessage={setReplyToMessage} />
            {pagination.hasLess && <Spinner />}
          </div>
          <UserTextArea
            scrollToEnd={() => setAutoScrollToEnd(true)}
            replyToMessage={replyToMessage}
            setReplyToMessage={setReplyToMessage}
          />
        </>
      ) : (
        <>
          <div className={s.channelHeader}></div>
          {joinedChannels.length === 0 && (
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
          )}
        </>
      )}
    </div>
  );
};

export default ChannelChat;
