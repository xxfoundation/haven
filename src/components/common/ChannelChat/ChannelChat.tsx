import type { Message } from 'src/types';

import { FC, useState, useEffect, useCallback, useMemo } from 'react';

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
import ScrollDiv from './ScrollDiv';

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
  const [replyToMessage, setReplyToMessage] = useState<Message | null>();
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const joinedChannels = useAppSelector(channels.selectors.channels);
  const paginatedItems = useMemo(() => pagination.paginate(messages), [messages, pagination]);
  
  useEffect(() => {
    setReplyToMessage(undefined);
  }, [currentChannel?.id]);

  useEffect(() => {
    pagination.setCount(messages.length);
  }, [messages.length, pagination])

  const onEmojiReaction = useCallback((emoji: string, messageId: string) =>  {
    if (cmix && cmix.ReadyToSend && !cmix.ReadyToSend()) {
      setModalView('NETWORK_NOT_READY');
      openModal();
    } else {
      sendReaction(emoji, messageId);
    }
  }, [cmix, openModal, sendReaction, setModalView]);

  useEffect(() => {
    pagination.reset();
  }, [currentChannel, pagination]);

  return (
    <div className={s.root}>
      {currentChannel ? (
        <>
          <ChannelHeader {...currentChannel} />
          <PinnedMessage 
            handleReplyToMessage={setReplyToMessage}
            onEmojiReaction={onEmojiReaction}
          />
          <ScrollDiv className={s.messagesContainer}>
            <MessagesContainer
              onEmojiReaction={onEmojiReaction}
              messages={paginatedItems}
              handleReplyToMessage={setReplyToMessage} />
          </ScrollDiv>
          <UserTextArea
            className={s.textArea}
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
