import type { Message } from 'src/types';
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

import classes from './MessageContainer.module.scss';
import delay from 'delay';

type Props = {
  className?: string;
  clamped?: boolean;
  readonly?: boolean;
  message: Message;
  handleReplyToMessage: (message: Message) => void;
  onEmojiReaction: (emoji: string, messageId: string) => void;
}

const MessageContainer: FC<Props> = ({ clamped = false, className, handleReplyToMessage, message, onEmojiReaction, readonly }) => {
  const [showActionsWrapper, setShowActionsWrapper] = useState(false);
  const {
    channelIdentity,
    currentChannel,
    deleteMessage,
    muteUser,
    pinMessage,
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

    promises.push(delay(5000));  // delay to let the nodes propagate

    await Promise.all(promises);

    muteUserModalToggle.toggleOff();
  }, [handleDeleteMessage, message.pubkey, muteUser, muteUserModalToggle]);

  const handlePinMessage = useCallback(async (unpin?: boolean) => {
    if (unpin === true) {
      await Promise.all([
        pinMessage(message, unpin),
        delay(8000) // delay to let the nodes propagate
      ]);
    } else {
      showPinModal();
    }
  }, [message, pinMessage, showPinModal])

  const pinSelectedMessage = useCallback(async () => {
    await Promise.all([
      pinMessage(message),
      delay(8000) // delay to let the nodes propagate
    ]);
    hidePinModal();
  }, [hidePinModal, message, pinMessage]);

  const handleEmojiReaction = useCallback((emoji: string) => {
    onEmojiReaction(emoji, message.id);
  }, [message.id, onEmojiReaction]);
  
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
        <div className={classes.container}>
          <MessageActions
            onMouseEnter={() => setShowActionsWrapper(true)}
            onMouseLeave={() => setShowActionsWrapper(false)}
            className={cn(classes.actions, {
              [classes.show]: showActionsWrapper
            })}
            isPinned={message.pinned}
            isMuted={userIsMuted(message.pubkey)}
            onMuteUser={muteUserModalToggle.toggleOn}
            onPinMessage={handlePinMessage}
            onReactToMessage={handleEmojiReaction}
            onReplyClicked={onReplyMessage}
            isAdmin={currentChannel?.isAdmin ?? false}
            isOwn={channelIdentity?.PubKey === message.pubkey}
            onDeleteMessage={showDeleteMessageModal}
          />
        </div>
      </>
    )}
    <ChatMessage
      className={className}
      clamped={clamped}
      onMouseEnter={() => setShowActionsWrapper(true)}
      onMouseLeave={() => setShowActionsWrapper(false)}
      onTouchEnd={() => setShowActionsWrapper(true)}
      message={message}
      onEmojiReaction={onEmojiReaction} />
    </>
  );
}

export default MessageContainer;
