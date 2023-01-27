import React, { FC, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import cn from 'classnames';
import Clamp from 'react-multiline-clamp';

import { Message } from 'src/types';
import { Close } from 'src/components/icons';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { useUI } from 'src/contexts/ui-context';
import s from './UserTextArea.module.scss';
import SendButton from '../SendButton';
import * as channels from 'src/store/channels';
import { useAppSelector } from 'src/store/hooks';

type Props = {
  scrollToEnd: () => void;
  replyToMessage: Message | null | undefined;
  setReplyToMessage: (msg: Message | null) => void;
};

const MESSAGE_MAX_SIZE = 700;

const UserTextArea: FC<Props> = ({
  replyToMessage,
  setReplyToMessage,
}) => {
  const [messageBody, setMessageBody] = useState<string>('');
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { openModal, setModalView } = useUI();
  const {
    cmix,
    isMuted,
    sendMessage,
    sendReply
  } = useNetworkClient();

  const messageIsValid = useMemo(() => messageBody.length <= MESSAGE_MAX_SIZE, [messageBody])
  const placeholder = useMemo(
    () => isMuted
      ? 'You have been muted by an admin and cannot send messages.'
      : 'Type your message here...',
    [isMuted]
  );

  useEffect(() => {
    if (currentChannel?.id) {
      setMessageBody('');
    }
  }, [currentChannel?.id, setMessageBody]);

  const sendCurrentMessage = useCallback(() => {
    if (cmix && cmix.ReadyToSend && !cmix.ReadyToSend()) {
      setModalView('NETWORK_NOT_READY');
      openModal();
    } else {
      if (isMuted) {
        setModalView('USER_WAS_MUTED');
        openModal();
        return;
      }

      if (!messageIsValid) {
        return;
      }

      if (replyToMessage) {
        sendReply(messageBody, replyToMessage.id);
      } else {
        sendMessage(messageBody);
      }

      setMessageBody('');
    }

    setReplyToMessage(null);
  }, [
    cmix,
    isMuted,
    messageBody,
    messageIsValid,
    openModal,
    replyToMessage,
    sendMessage,
    sendReply,
    setModalView,
    setMessageBody,
    setReplyToMessage
  ]);

  return (
    <div className={cn('relative', s.textArea)}>
      {replyToMessage && (
        <div className={cn(s.replyContainer)}>
          <div className='flex flex-col flex-1'>
            <span>Reply to {replyToMessage.codename}</span>
            <Clamp lines={1}><p>{replyToMessage.body}</p></Clamp>
          </div>
          <Close
            width={14}
            height={14}
            fill={'var(--orange)'}
            onClick={() => {
              setReplyToMessage(null);
            }}
          />
        </div>
      )}

      <textarea
        className={cn({ [s.muted]: isMuted })}
        ref={textAreaRef}
        name=''
        placeholder={placeholder}
        value={messageBody}
        onChange={e => {
          setMessageBody(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            sendCurrentMessage();
            e.preventDefault();
          }
        }}
      />

      <span style={{
        fontSize: 12,
        color: messageIsValid || isMuted ? 'var(--dark-9)' : 'var(--red)'}} className='absolute left-0 bottom-0 p-2'>
          {messageBody.length ?? 0}/700
      </span>

      <div className={s.buttonsWrapper}>
        <SendButton
          disabled={!messageIsValid}
          className={s.button}
          onClick={sendCurrentMessage}
        />
      </div>
    </div>
  );
};

export default UserTextArea;
