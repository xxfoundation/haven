import { Message, MessageStatus } from 'src/types';
import type{ FC } from 'react';

import { useCallback, useState } from 'react';
import cn from 'classnames';

import MessageActions from '../MessageActions';
import ChatMessage from '../ChatMessage/ChatMessage';
import { useNetworkClient } from 'src/contexts/network-client-context';
import useToggle from 'src/hooks/useToggle';
import PinMessageModal from 'src/components/modals/PinMessageModal';
import MuteUserModal, { MuteUserAction } from 'src/components/modals/MuteUser';
import DeleteMessageModal from 'src/components/modals/DeleteMessage';
import * as channels from 'src/store/channels';
import { useAppSelector } from 'src/store/hooks';

import classes from './MessageContainer.module.scss';
import * as identity from 'src/store/identity';
import { awaitEvent, Event } from 'src/events';


type Props = {
  className?: string;
  clamped?: boolean;
  readonly?: boolean;
  message: Message;
  handleReplyToMessage: (message: Message) => void;
}

const MessageContainer: FC<Props> = ({ clamped = false, className, handleReplyToMessage, message, readonly }) => {
  const { pubkey } = useAppSelector(identity.selectors.identity) ?? {};
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const [showActionsWrapper, setShowActionsWrapper] = useState(false);
  const {
    deleteMessage,
    muteUser,
    pinMessage,
    sendReaction,
    userIsMuted
  } = useNetworkClient();

  const [muteUserModalOpen, muteUserModalToggle] = useToggle();
  const [deleteMessageModalOpened, {
    toggleOff: hideDeleteMessageModal,
    toggleOn: showDeleteMessageModal
  } ] = useToggle();
  const [pinMessageModalOpen, {
    toggleOff: hidePinModal,
    toggleOn: showPinModal
  }] = useToggle();

  const onReplyMessage = useCallback(() => {
    handleReplyToMessage(message);
  }, [handleReplyToMessage, message]);

  const handleDeleteMessage = useCallback(async () => {
    await deleteMessage(message);
    hideDeleteMessageModal();
  }, [deleteMessage, hideDeleteMessageModal, message])

  const handleMuteUser = useCallback(async (action: MuteUserAction) => {
    const promises: Promise<unknown>[] = [];

    if (action === 'mute+delete') {
      promises.push(handleDeleteMessage());
    }

    promises.push(muteUser(message.pubkey, false));

    promises.push(awaitEvent(Event.USER_MUTED));  // delay to let the nodes propagate

    await Promise.all(promises);

    muteUserModalToggle.toggleOff();
  }, [handleDeleteMessage, message.pubkey, muteUser, muteUserModalToggle]);

  const handlePinMessage = useCallback(async (unpin?: boolean) => {
    if (unpin === true) {
      await Promise.all([
        pinMessage(message, unpin),
        awaitEvent(Event.MESSAGE_UNPINNED) // delay to let the nodes propagate
      ]);
    } else {
      showPinModal();
    }
  }, [message, pinMessage, showPinModal])

  const pinSelectedMessage = useCallback(async () => {
    await Promise.all([
      pinMessage(message),
      awaitEvent(Event.MESSAGE_PINNED) // delay to let the nodes propagate
    ]);
    hidePinModal();
  }, [hidePinModal, message, pinMessage]);

  const handleEmojiReaction = useCallback((emoji: string) => {
    sendReaction(emoji, message.id);
  }, [message.id, sendReaction]);
  
  return (
    <>{!readonly && (
      <>
        {muteUserModalOpen && (
          <MuteUserModal
            onConfirm={handleMuteUser}
            onCancel={muteUserModalToggle.toggleOff} />
        )}
        {deleteMessageModalOpened && (
          <DeleteMessageModal
            onConfirm={handleDeleteMessage}
            onCancel={hideDeleteMessageModal} />
        )}
        {pinMessageModalOpen && (
          <PinMessageModal
            onConfirm={pinSelectedMessage}
            onCancel={hidePinModal} />
        )}
        {message.status !== MessageStatus.Unsent && (
          <div className={classes.container}>
            <MessageActions
              pubkey={message.pubkey}
              onMouseEnter={() => setShowActionsWrapper(true)}
              onMouseLeave={() => setShowActionsWrapper(false)}
              className={cn(classes.actions, {
                [classes.show]: showActionsWrapper
              })}
              dmsEnabled={message.dmToken !== undefined}
              isPinned={message.pinned}
              isMuted={userIsMuted(message.pubkey)}
              onMuteUser={muteUserModalToggle.toggleOn}
              onPinMessage={handlePinMessage}
              onReactToMessage={handleEmojiReaction}
              onReplyClicked={onReplyMessage}
              isAdmin={currentChannel?.isAdmin ?? false}
              isOwn={pubkey === message.pubkey}
              onDeleteMessage={showDeleteMessageModal}
            />
          </div>
        )}
      </>
    )}
    <ChatMessage
      className={className}
      clamped={clamped}
      onMouseEnter={() => setShowActionsWrapper(true)}
      onMouseLeave={() => setShowActionsWrapper(false)}
      onTouchEnd={() => setShowActionsWrapper(true)}
      message={message} />
    </>
  );
}

export default MessageContainer;
