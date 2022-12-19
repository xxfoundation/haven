import type { Message } from 'src/types';
import type { FC } from 'react';

import { useCallback, useState } from 'react';
import cn from 'classnames';

import MessageActions from '../MessageActions';
import ChatMessage from '../ChatMessage/ChatMessage';
import { useNetworkClient } from 'src/contexts/network-client-context';
import useToggle from 'src/hooks/useToggle';
import PinMessageModal from 'src/components/common/Modals/PinMessageModal';
import MuteUserModal, { MuteUserAction } from 'src/components/common/Modals/MuteUser';
import DeleteMessageModal from 'src/components/common/Modals/DeleteMessage';
import classes from './MessageContainer.module.scss';

type Props = {
  message: Message;
  handleReplyToMessage: (message: Message) => void;
  onEmojiReaction: (emoji: string, messageId: string) => void;
}

const MessageContainer: FC<Props> = ({ handleReplyToMessage, message, onEmojiReaction }) => {
  const [showActionsWrapper, setShowActionsWrapper] = useState(false);
  const {
    channelIdentity,
    currentChannel,
    deleteMessage,
    muteUser,
    pinMessage,
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

    await Promise.all(promises);

    muteUserModalToggle.toggleOff();
  }, [handleDeleteMessage, message.pubkey, muteUser, muteUserModalToggle]);

  const handlePinMessage = useCallback(async (unpin?: boolean) => {
    if (unpin === true) {
      await pinMessage(message, unpin);
    } else {
      showPinModal();
    }
  }, [message, pinMessage, showPinModal])

  const pinSelectedMessage = useCallback(async () => {
    await pinMessage(message);
    hidePinModal();
  }, [hidePinModal, message, pinMessage]);

  const handleEmojiReaction = useCallback((emoji: string) => {
    onEmojiReaction(emoji, message.id);
  }, [message.id, onEmojiReaction])
  
  return (
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
          onMuteUser={muteUserModalToggle.toggleOn}
          onPinMessage={handlePinMessage}
          onReactToMessage={handleEmojiReaction}
          onReplyClicked={onReplyMessage}
          isAdmin={currentChannel?.isAdmin ?? false}
          isOwn={channelIdentity?.PubKey === message.pubkey}
          onDeleteMessage={showDeleteMessageModal}
        />
      </div>
      <ChatMessage
        onMouseEnter={() => setShowActionsWrapper(true)}
        onMouseLeave={() => setShowActionsWrapper(false)}
        onTouchEnd={() => setShowActionsWrapper(true)}
        message={message}
        onEmojiReaction={onEmojiReaction} />
    </>
  );
}

export default MessageContainer;
