import type { Message } from 'src/types';

import React, { FC, HTMLAttributes, useMemo } from 'react';
import cn from 'classnames';
import 'moment-timezone';
import moment from 'moment';
import Clamp from 'react-multiline-clamp';

import Identity from 'src/components/common/Identity';
import s from './ChatMessage.module.scss';
import ChatReactions from '../ChatReactions';
import { useAppSelector } from 'src/store/hooks';
import * as messages from 'src/store/messages';
import { inflate } from '@utils/index';

type Props = HTMLAttributes<HTMLDivElement> & {
  clamped: boolean;
  onEmojiReaction?: (emoji: string, messageId: string) => void;
  message: Message;
}

const ChatMessage: FC<Props> = ({ clamped, message, onEmojiReaction, ...htmlProps }) => {
  const repliedToMessage = useAppSelector(messages.selectors.repliedTo(message));
  const markup = useMemo(
    () => inflate(message.body),
    [message.body]
  );
  const replyMarkup = useMemo(
    () => repliedToMessage && inflate(repliedToMessage.body),
    [repliedToMessage]
  );
  
  return (
    <div
      id={message.id}
      {...htmlProps}
      className={cn(
        htmlProps.className,
        'flex items-center',
        s.root,
        {
          [s.root__withReply]: message.repliedTo !== null
        },
        htmlProps.className
      )}
    >
      <div className={cn('w-full')}>
        <div className={cn(s.header)}>
          {message.repliedTo !== null ? (
            <>
              <Identity {...message} />
              <span className={cn(s.separator, 'mx-1')}>
                replied to
              </span>
              {repliedToMessage
                ? <Identity {...repliedToMessage} />
                : <span className={cn(s.separator, '')}><strong>deleted/unknown</strong></span>}

            </>
          ) : (
            <Identity {...message} />
          )}

          <span className={cn(s.messageTimestamp)}>
            {moment(message.timestamp).format('hh:mm A')}
          </span>
          {message.round !== 0 && (
            <a
              href={`https://dashboard.xx.network/rounds/${message.round}`}
              target='_blank'
              rel='noreferrer'
              className='text text--xs ml-2'
              style={{
                whiteSpace: 'nowrap',
                fontSize: '9px',
                color: 'var(--text-secondary)',
                textDecoration: 'underline',
                marginBottom: '1px'
              }}
            >
              Show mix
            </a>
          )}
        </div>

        <div className={cn('message-body', s.body)}>
          {message.repliedTo !== null && (
            <p
              className={cn(s.replyToMessageBody)}
              onClick={() => {
                if (repliedToMessage) {
                  const originalMessage = document.getElementById(
                    repliedToMessage.id || ''
                  );
                  if (originalMessage) {
                    originalMessage.scrollIntoView();
                    originalMessage.classList.add(s.root__highlighted);
                    setTimeout(() => {
                      originalMessage.classList.remove(s.root__highlighted);
                    }, 3000);
                  }
                }
              }}
            >
              {repliedToMessage && replyMarkup ? (
                <>
                  <Identity {...repliedToMessage} />
                  <Clamp lines={3}>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: replyMarkup
                      }}
                    ></p>
                  </Clamp>
                </>
              ) : (
                <>This message is unknown/deleted</>
              )}
            </p>
          )}
          <Clamp
            showMoreElement={({ toggle }: { toggle: () => void }) => (
              <button style={{ color: 'var(--cyan)'}} type='button' onClick={toggle}>
                Show more
              </button>
            )}
            showLessElement={({ toggle }: { toggle: () => void }) => (
              <button style={{ color: 'var(--cyan)'}} type='button' onClick={toggle}>
                Show less
              </button>
            )}
            maxLines={Number.MAX_SAFE_INTEGER}
            withToggle={clamped}
            lines={clamped ? 3 : Number.MAX_SAFE_INTEGER}>
            {markup ? <p
              className={cn(s.messageBody, {
                [s.messageBody__failed]: message.status === 3
              })}
              dangerouslySetInnerHTML={{
                __html: markup
              }}
            /> : <p></p>}
          </Clamp>
        </div>
        <ChatReactions message={message} onEmojiReaction={onEmojiReaction} />
      </div>
    </div>
  );
};

export default ChatMessage;
