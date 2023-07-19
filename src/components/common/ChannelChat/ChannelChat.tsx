import { Message } from 'src/types';

import { FC, useState, useEffect, useMemo } from 'react';

import UserTextArea from './UserTextArea/UserTextArea';
import { useNetworkClient } from 'src/contexts/network-client-context';
import spaceman from 'src/assets/images/spaceman.svg';

import s from './ChannelChat.module.scss';
import MessagesContainer from './MessagesContainer';
import * as channels from 'src/store/channels';
import * as dms from 'src/store/dms';
import {  useAppSelector } from 'src/store/hooks';
import ScrollDiv from './ScrollDiv';
import { useTranslation } from 'react-i18next';
import { useUI } from '@contexts/ui-context';

type Props = {
  messages: Message[];
  isPinnedMessages?: boolean;
}

const ChannelChat: FC<Props> = ({ messages }) => {
  const { t } = useTranslation();
  const {  pagination } = useNetworkClient();
  const { reset } = pagination;
  
  const [replyToMessage, setReplyToMessage] = useState<Message | null>();
  const { sidebarView } = useUI();
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const currentConversation = useAppSelector(dms.selectors.currentConversation);
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

  return (
    <>
      {((currentChannel && sidebarView === 'spaces') || (currentConversation && sidebarView === 'dms')) && (
        <>

          {messages.length === 0 ? (
            <div className='flex flex-col justify-center items-center flex-grow'>
              <img style={{ margin: '-15%'}} src={spaceman.src} />
              <p className='text-charcoal-2 font-bold'>
                {t('It\'s pretty quiet in this space...')}
              </p>
            </div>
          ) : (
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
          )}
          <UserTextArea
            className={s.textArea}
            replyToMessage={replyToMessage}
            setReplyToMessage={setReplyToMessage}
          />
        </>
      )}
    </>
  );
};

export default ChannelChat;
