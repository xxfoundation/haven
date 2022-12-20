import type { Message } from 'src/types';

import { FC, useState, useEffect, useRef, useCallback, useMemo } from 'react';

import cn from 'classnames';

import UserTextArea from './UserTextArea/UserTextArea';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { Tree } from 'src/components/icons';
import { PrivacyLevel } from 'src/contexts/utils-context';

import s from './ChannelChat.module.scss';
import MessagesContainer from './MessagesContainer';

const privacyLevelLabels: Record<PrivacyLevel, string> = {
  [PrivacyLevel.Private]: 'Private',
  [PrivacyLevel.Public]: 'Public',
  [PrivacyLevel.Secret]: 'Secret'
};

type Props = {
  messages: Message[];
}

const ChannelChat: FC<Props> = ({ messages }) => {
  const {
    channels,
    currentChannel,
    getShareURL,
    getShareUrlType,
    loadMoreChannelData
  } = useNetworkClient()
  const messagesContainerRef = useRef<HTMLDivElement>(null); 
  const [replyToMessage, setReplyToMessage] = useState<Message | null>();
  const [autoScrollToEnd, setAutoScrollToEnd] = useState<boolean>(true);
  const [currentChannelPrivacyLevel, setCurrentChannelPrivacyLevel] = useState<PrivacyLevel | null>(null);


  const currentChannelMessages = useMemo(
    () => messages.filter(m =>  m.channelId === currentChannel?.id),
    [currentChannel?.id, messages]
  );

  useEffect(() => {
    setReplyToMessage(undefined);
    if (currentChannel?.id) {
      const shareUrl = getShareURL();

      if (shareUrl) {
        const type = getShareUrlType(shareUrl?.url || '');
        setCurrentChannelPrivacyLevel(type);
      }
    }
  }, [currentChannel?.id, getShareURL, getShareUrlType]);


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
      await loadMoreChannelData(currentChannel.id);

      if (
        messagesContainerRef &&
        messagesContainerRef.current &&
        messagesContainerRef.current.scrollTop === 0
      ) {
        messagesContainerRef.current.scrollTop = 20;
      }
    }
  }, [currentChannel, loadMoreChannelData]);

  const scrollToEnd = useCallback(() => {
    if (messagesContainerRef && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
    setAutoScrollToEnd(true);
  }, []);

  useEffect(() => {
    if (!document.querySelector('.emoji-picker-react') && autoScrollToEnd) {
      scrollToEnd();
    }
  }, [autoScrollToEnd, scrollToEnd]);


  return (
    <div className={s.root}>
      {currentChannel ? (
        <>
          <div className={s.channelHeader}>
            <div className={'headline--sm flex items-center'}>
              {currentChannelPrivacyLevel !== null && (
                <span
                  className={cn(s.channelType, {
                    [s.channelType__gold]: currentChannelPrivacyLevel === PrivacyLevel.Public
                  })}
                >
                  {privacyLevelLabels[currentChannelPrivacyLevel]}
                </span>
              )}
              <span className={cn('mr-2', s.channelName)}>
                {currentChannel?.name}{' '}
              </span>
              <span className={cn('headline--xs', s.channelId)}>
                (id: {currentChannel?.id})
              </span>
            </div>
            <p className={'text mt-2'}>{currentChannel?.description}</p>
          </div>
          <div ref={messagesContainerRef}>
            <MessagesContainer
              messages={currentChannelMessages}
              handleReplyToMessage={setReplyToMessage} />
          </div>
          <UserTextArea
              setAutoScrollToEnd={setAutoScrollToEnd}
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
