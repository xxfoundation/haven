import type { Message } from 'src/types';

import React, { FC, HTMLAttributes, useMemo } from 'react';
import cn from 'classnames';
import 'moment-timezone';
import moment from 'moment';
import DOMPurify from 'dompurify';

import Identity from 'src/components/common/Identity';
import { ToolTip } from 'src/components/common';

import s from './ChatMessage.module.scss';

const mapTextToHtmlWithAnchors = (text: string) => {
  const returnVal = text.replace(
    /(https?:\/\/)([^ ]+)/g,
    '<a target="_blank" href="$&">$2</a>'
  );
  return DOMPurify.sanitize(returnVal, {
    ALLOWED_TAGS: ['a'],
    ALLOWED_ATTR: ['target', 'href']
  });
};

type EmojiReactions = {
  emoji: string;
  users: string[];
}

type Props = HTMLAttributes<HTMLDivElement> & {
  onEmojiReaction?: (emoji: string, messageId: string) => void;
  message: Message;
}

const ChatMessage: FC<Props> = ({
    message,
    onEmojiReaction = () => {},
    ...props
  }) => {

  const emojiReactions = useMemo<EmojiReactions[] | undefined>(
    () => message.emojisMap && Array.from(message.emojisMap.entries())
      .map(([emoji, users]) => ({ emoji, users})),
    [message.emojisMap]
  );
  
  return (
    <div
    {...props}
      className={cn(
        props.className,
        'flex items-center',
        s.root,
        {
          [s.root__withReply]: !!message.replyToMessage
        },
        props.className
      )}
      id={message.id}
    >

      <div className={cn('flex flex-col', s.messageWrapper)}>
        <div className={cn(s.header)}>
          {message.replyToMessage ? (
            <>
              <Identity {...message} />
              <span className={cn(s.separator, 'mx-1')}>replied to</span>

              <Identity {...message.replyToMessage} />
            </>
          ) : (
            <Identity {...message} />
          )}

          <span className={cn(s.messageTimestamp)}>
            {moment(message.timestamp).format('hh:mm A')}
          </span>
          <a
            href={`https://dashboard.xx.network/rounds/${message.round}`}
            target='_blank'
            rel='noreferrer'
            className='text text--xs ml-2'
            style={{
              fontSize: '9px',
              color: 'var(--text-secondary)',
              textDecoration: 'underline',
              marginBottom: '1px'
            }}
          >
            Show mix
          </a>
        </div>

        <div className={cn(s.body)}>
          {message.replyToMessage && (
            <p
              className={cn(s.replyToMessageBody)}
              onClick={() => {
                const originalMessage = document.getElementById(
                  message?.replyToMessage?.id || ''
                );
                if (originalMessage) {
                  originalMessage.scrollIntoView();
                  originalMessage.classList.add(s.root__highlighted);
                  setTimeout(() => {
                    originalMessage.classList.remove(s.root__highlighted);
                  }, 3000);
                }
              }}
            >
              <Identity {...message.replyToMessage} />
              <p
                dangerouslySetInnerHTML={{
                  __html: mapTextToHtmlWithAnchors(message.replyToMessage.body)
                }}
              ></p>
            </p>
          )}
          <p
            className={cn(s.messageBody, {
              [s.messageBody__failed]: message.status === 3
            })}
            dangerouslySetInnerHTML={{
              __html: mapTextToHtmlWithAnchors(message.body)
            }}
          ></p>
        </div>
        {message.emojisMap && (
          <div className={cn(s.footer)}>
            <div className={cn(s.emojisWrapper)}>
              {Array.from(message.emojisMap.keys()).map(emoji => {
                return (
                  <div
                    key={`${message.id}-${emoji}`}
                    data-tip
                    data-for={`${message.id}-${emoji}-emojis-users-reactions`}
                    className={cn(s.emoji)}
                    onClick={() => onEmojiReaction(emoji, message.id)}
                  >
                    <span className='mr-1'>{emoji}</span>
                    <span className={cn(s.emojiCount)}>
                      {message.emojisMap?.get(emoji)?.length}
                    </span>
                  </div>
                );
              })}
            </div>
            {emojiReactions?.map(({ emoji, users }) =>  (
              <ToolTip
                key={emoji}
                tooltipProps={{
                  id: `${message.id}-${emoji}-emojis-users-reactions`,
                  effect: 'solid',
                  place: 'top',
                  className: s.emojisTooltip
                }}
              >
                <div className={cn(s.emojiIcon)}>{emoji}</div>
                <p>
                  {users.length === 1
                    ? users[0] + ' reacted with '
                    : users.length === 2
                    ? `${users[0]} and ${users[1]} reacted with `
                    : users.slice(0, users.length - 1).join(', ') +
                      ` and ${users[users.length - 1]} reacted with `}
                  <span style={{ fontSize: '18px', marginLeft: '4px' }}>
                    {emoji}
                  </span>
                </p>
              </ToolTip>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
