import React, { FC, useEffect, useRef, useCallback } from 'react';
import cn from 'classnames';

import { Message } from 'src/types';
import { Close } from 'src/components/icons';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { useUI } from 'src/contexts/ui-context';
import s from './UserTextArea.module.scss';
import SendButton from '../SendButton';

type Props = {
  scrollToEnd: () => void;
  replyToMessage: Message | null | undefined;
  setReplyToMessage: (msg: Message | null) => void;
  messageBody: string;
  setMessageBody: React.Dispatch<React.SetStateAction<string>>
};

const MESSAGE_MAX_SIZE = 700;

const UserTextArea: FC<Props> = ({
  messageBody,
  replyToMessage,
  setMessageBody,
  setReplyToMessage,
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { openModal, setModalView } = useUI();
  const {
    cmix,
    currentChannel,
    getMuted,
    sendMessage,
    sendReply
  } = useNetworkClient();

  useEffect(() => {
    if (currentChannel?.id) {
      setMessageBody('');
    }
  }, [currentChannel?.id, setMessageBody]);

  const checkMessageLength = useCallback(
    () => messageBody.trim().length > MESSAGE_MAX_SIZE,
    [messageBody]
  );

  return (
    <div className={cn('relative', s.textArea)}>
      {replyToMessage && (
        <div className={cn(s.replyContainer)}>
          <div className='flex flex-col flex-1'>
            <span>Reply to {replyToMessage.codename}</span>
            <p>{replyToMessage.body}</p>
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
        ref={textAreaRef}
        name=''
        placeholder='Type your message here...'
        value={messageBody}
        onChange={e => {
          setMessageBody(e.target.value);
        }}
        onKeyDown={e => {
          if (e.keyCode === 13 && !e.shiftKey) {
            e.preventDefault();
            if (cmix && cmix.ReadyToSend && !cmix.ReadyToSend()) {
              setModalView('NETWORK_NOT_READY');
              openModal();
            } else {
              const muted = getMuted();
              if (muted) {
                setModalView('USER_WAS_BANNED');
                openModal();
                return;
              }
              if (replyToMessage) {
                if (checkMessageLength()) {
                  sendReply(messageBody.trim(), replyToMessage.id);
                  setMessageBody('');
                }
              } else {
                if (checkMessageLength()) {
                  sendMessage(messageBody.trim());
                  setMessageBody('');
                }
              }
            }

            setReplyToMessage(null);
          }
        }}
      />

      <span style={{
        fontSize: 12,
        color: messageBody.trim().length > MESSAGE_MAX_SIZE ? 'var(--red)' : 'var(--dark-9)' }} className='absolute left-0 bottom-0 p-2'>
          {messageBody.trim().length ?? 0}/700
      </span>

      <div className={s.buttonsWrapper}>
        <SendButton
          disabled={messageBody.trim().length > MESSAGE_MAX_SIZE}
          className={s.button}
          onClick={async () => {
            if (cmix && cmix.ReadyToSend && !cmix.ReadyToSend()) {
              setModalView('NETWORK_NOT_READY');
              openModal();
            } else {
              const muted = getMuted();
              if (muted) {
                setModalView('USER_WAS_BANNED');
                openModal();
                return;
              }
              if (replyToMessage) {
                if (checkMessageLength()) {
                  sendReply(messageBody.trim(), replyToMessage.id);
                  setMessageBody('');
                }
              } else {
                if (checkMessageLength()) {
                  sendMessage(messageBody.trim());
                  setMessageBody('');
                }
              }
            }

            setReplyToMessage(null);
          }}
        />
      </div>
    </div>
  );
};

export default UserTextArea;
