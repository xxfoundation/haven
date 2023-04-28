import { Message } from 'src/types';

import { FC, useState, useEffect, useMemo, useCallback } from 'react';

import UserTextArea from './UserTextArea/UserTextArea';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { Tree } from 'src/components/icons';

import s from './ChannelChat.module.scss';
import MessagesContainer from './MessagesContainer';
import PinnedMessage from './PinnedMessage';
import ChannelHeader from '../ChannelHeader';
import * as channels from 'src/store/channels';
import * as dms from 'src/store/dms';
import { useAppSelector } from 'src/store/hooks';
import ScrollDiv from './ScrollDiv';
import Identity from '../Identity';
import { useTranslation } from 'react-i18next';
import Button from '../Button/Button';

type Props = {
  messages: Message[];
  isPinnedMessages?: boolean;
}

const XX_GENERAL_CHAT_PRETTY_PRINT= '<Speakeasy-v3:xxGeneralChat|description:Talking about the xx network|level:Public|created:1674152234202224215|secrets:rb+rK0HsOYcPpTF6KkpuDWxh7scZbj74kVMHuwhgUR0=|RMfN+9pD/JCzPTIzPk+pf0ThKPvI425hye4JqUxi3iA=|368|1|/qE8BEgQQkXC6n0yxeXGQjvyklaRH6Z+Wu8qvbFxiuw=>';


const ChannelChat: FC<Props> = ({ messages }) => {
  const { t } = useTranslation();
  const { joinChannel, pagination } = useNetworkClient();
  const { reset } = pagination;
  const [replyToMessage, setReplyToMessage] = useState<Message | null>();
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const joinedChannels = useAppSelector(channels.selectors.channels);
  const currentConversation = useAppSelector(dms.selectors.currentConversation)
  const paginatedItems = useMemo(() => pagination.paginate(messages), [messages, pagination]);

  useEffect(() => {
    setReplyToMessage(undefined);
  }, [currentChannel?.id]);

  useEffect(() => {
    pagination.setCount(messages.length);
  }, [messages.length, pagination]);

  const [autoScroll, setAutoScroll] = useState(true);
  useEffect(() => {
    reset();
    setAutoScroll(true);
  }, [currentChannel?.id, reset]);

  const joinGeneralChat = useCallback(() =>  joinChannel(XX_GENERAL_CHAT_PRETTY_PRINT ?? '', true, true), [joinChannel]);

  return (
    <div className={s.root}>
      {currentChannel || currentConversation ? (
        <>
          {currentChannel && (
            <>
              <ChannelHeader {...currentChannel} />
              <PinnedMessage 
                handleReplyToMessage={setReplyToMessage}
              />
            </>
          )}
          {currentConversation && (
            <ChannelHeader
              id={currentConversation.pubkey}
              isAdmin={false}
              name={<Identity {...currentConversation} />}
              description=''
              privacyLevel={null} />
          )}
          <ScrollDiv
            canSetAutoScroll={pagination.page === 1}
            autoScrollBottom={autoScroll}
            setAutoScrollBottom={setAutoScroll}
            nearBottom={pagination.previous}
            nearTop={pagination.next}
            className={s.messagesContainer}>
            <MessagesContainer
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
                {t(`You haven't joined any channels yet. You can create or join a
                channel to start the journey!`)}
              </div>
              <div
               className='mb-4'
                style={{
                  fontSize: '12px',
                  lineHeight: '14px',
                  marginTop: '14px',
                  maxWidth: '280px',
                  fontWeight: '700',
                  color: 'var(--text-primary)'
                }}
              >
                {t('If you\'d like to stay up to date with xx network developments we have the perfect channel for you:')}
              </div>

              <Button onClick={joinGeneralChat}>Join xxGeneralChat</Button>
            </div>
          )}
          <p>

          </p>
        </>
      )}
    </div>
  );
};

export default ChannelChat;
