import type { Message, EmojiReaction } from 'src/types';

import { FC, useState, useEffect, useRef, useCallback, useMemo } from 'react';

import cn from 'classnames';
import moment from 'moment';
import _ from 'lodash';

import UserTextArea from './components/UserTextArea/UserTextArea';
import ChatMessage from './components/ChatMessage/ChatMessage';
import { IdentityJSON, useNetworkClient } from 'src/contexts/network-client-context';
import { useUI } from 'src/contexts/ui-context';
import { Tree } from 'src/components/icons';
import { Spinner } from 'src/components/common';
import { byEntryTimestamp } from 'src/utils/index';
import { PrivacyLevel } from 'src/contexts/utils-context';
import useToggle from 'src/hooks/useToggle';
import MuteUserModal, { MuteUserAction } from '../Modals/MuteUser';
import DeleteMessageModal from '../Modals/DeleteMessage';

import s from './ChannelChat.module.scss';
import PinMessageModal from '../Modals/PinMessageModal';

const privacyLevelLabels: Record<PrivacyLevel, string> = {
  [PrivacyLevel.Private]: 'Private',
  [PrivacyLevel.Public]: 'Public',
  [PrivacyLevel.Secret]: 'Secret'
};

type Props = {
  messages: Message[];
}

const ChannelChat: FC<Props> = ({ messages }) => {
  const [muteUserModalOpen, muteUserModalToggle] = useToggle();
  const [deleteMessageModalOpened, {
    toggleOff: hideDeleteMessageModal,
    toggleOn: showDeleteMessageModal
  } ] = useToggle();
  const [pinMessageModalOpen, {
    toggleOff: hidePinModal,
    toggleOn: showPinModal
  }] = useToggle();
  const {
    channels,
    cmix,
    currentChannel,
    deleteMessage,
    getIdentity,
    getShareURL,
    getShareUrlType,
    loadMoreChannelData,
    muteUser,
    pinMessage,
    sendReaction
  } = useNetworkClient();
  const { openModal, setModalView } = useUI();
  const [channelIdentity, setChannelIdentity] = useState<IdentityJSON | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>();
  const [autoScrollToEnd, setAutoScrollToEnd] = useState<boolean>(true);
  const [currentChannelPrivacyLevel, setCurrentChannelPrivacyLevel] = useState<PrivacyLevel | null>(null);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (currentChannel && !currentChannel?.isLoading) {
      const identity = getIdentity();
      setChannelIdentity(identity);
    }
  }, [currentChannel, getIdentity])

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

  const currentChannelMessages = useMemo(
    () => messages.filter(m =>  m.channelId === currentChannel?.id),
    [currentChannel?.id, messages]
  );

  const sortedGroupedMessagesPerDay = useMemo(() => {
    const groupedMessagesPerDay = _.groupBy(
      currentChannelMessages,
      (message) => moment(
        moment(message.timestamp),
        'DD/MM/YYYY'
      ).startOf('day')
    );

    return Object.entries(groupedMessagesPerDay)
      .sort(byEntryTimestamp);
  }, [currentChannelMessages])

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
  }, [currentChannelMessages, autoScrollToEnd, scrollToEnd]);

  const handleReactToMessage = useCallback((
    reaction: EmojiReaction,
    message: Message
  ) => {
    if (cmix && cmix.ReadyToSend && !cmix.ReadyToSend()) {
      setModalView('NETWORK_NOT_READY');
      openModal();
    } else {
      if (message.id) {
        sendReaction(reaction.emoji, message.id);
      }
    }
  }, [cmix, openModal, sendReaction, setModalView]);

  const handleReplyToMessage = useCallback((message: Message) => () => {
    if (textAreaRef && textAreaRef.current) {
      textAreaRef.current.focus();
    }
    setReplyToMessage(message);
  }, []);

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const showMuteModal = useCallback((message: Message) => () => {
    setSelectedMessage(message);
    muteUserModalToggle.toggleOn();
  }, [muteUserModalToggle]);

  const deleteSelectedMessage = useCallback(async () => {
    if (selectedMessage) {
      await deleteMessage(selectedMessage);
    }
    setSelectedMessage(null);
    hideDeleteMessageModal();
  }, [deleteMessage, hideDeleteMessageModal, selectedMessage])

  const handleMuteUser = useCallback(async (action: MuteUserAction) => {
    if (!selectedMessage) {
      return;
    }

    const promises: Promise<unknown>[] = [];

    if (action === 'mute+delete' && selectedMessage) {
      promises.push(deleteSelectedMessage());
    }

    promises.push(muteUser(selectedMessage.pubkey, false));

    await Promise.all(promises);

    muteUserModalToggle.toggleOff();
  }, [deleteSelectedMessage, muteUser, muteUserModalToggle, selectedMessage]);

  const onDeleteMessage = useCallback((message: Message) => () => {
    setSelectedMessage(message);
    showDeleteMessageModal();
  }, [showDeleteMessageModal]);

  const handlePinMessage = useCallback((message: Message) => async (unpin?: boolean) => {
    if (unpin === true) {
      await pinMessage(message, unpin);
    } else {
      setSelectedMessage(message);
      showPinModal();
    }
  }, [pinMessage, showPinModal])

  const pinSelectedMessage = useCallback(async () => {
    if (selectedMessage) {
      await pinMessage(selectedMessage);
    }
    setSelectedMessage(null);
    hidePinModal();
  }, [hidePinModal, pinMessage, selectedMessage]);

  const onMuteUserModalCancel = useCallback(() => {
    setSelectedMessage(null);
    muteUserModalToggle.toggleOff();
  }, [muteUserModalToggle])

  return (
    <div className={s.root}>
      {muteUserModalOpen && (
        <MuteUserModal
          onConfirm={handleMuteUser}
          onCancel={onMuteUserModalCancel} />
      )}
      {deleteMessageModalOpened && (
        <DeleteMessageModal
          onConfirm={deleteSelectedMessage}
          onCancel={hideDeleteMessageModal} />
      )}
      {pinMessageModalOpen && (
        <PinMessageModal
          onConfirm={pinSelectedMessage}
          onCancel={hidePinModal} />
      )}
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
          <div
            id={'messagesContainer'}
            className={cn(s.messagesContainer)}
            ref={messagesContainerRef}
            onScroll={() => {
              checkTop();
              if (checkBottom()) {
                setAutoScrollToEnd(true);
              } else {
                setAutoScrollToEnd(false);
              }
            }}
          >
            {currentChannel.isLoading ? (
              <div className='m-auto flex w-full h-full justify-center items-center'>
                <Spinner />
              </div>
            ) : (
              sortedGroupedMessagesPerDay.map(([key, message]) => {
                return (
                  <div className={cn(s.dayMessagesWrapper)} key={key}>
                    <div className={s.separator}></div>
                    <span className={cn(s.currentDay)}>
                      {moment(key).format('dddd MMMM Do, YYYY')}
                    </span>
                    <div>
                      {message.map((m, index) => (
                        <ChatMessage
                          isOwn={channelIdentity?.PubKey === m.pubkey}
                          isAdmin={currentChannel?.isAdmin}
                          key={`${m.id}${m.status}${index}`}
                          message={m}
                          onDeleteMessage={onDeleteMessage(m)}
                          onMuteUser={showMuteModal(m)}
                          onPinMessage={handlePinMessage(m)}
                          onReactToMessage={(reaction: EmojiReaction) => {
                            handleReactToMessage(reaction, m);
                          }}
                          onReplyClicked={handleReplyToMessage(m)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
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
