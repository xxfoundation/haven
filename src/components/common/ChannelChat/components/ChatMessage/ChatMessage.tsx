import type { EmojiReaction, Message } from 'src/types';
import type { BaseEmoji } from 'emoji-mart';

import React, { CSSProperties, FC, useCallback, useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import 'moment-timezone';
import moment from 'moment';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import DOMPurify from 'dompurify';

import Identity from 'src/components/common/Identity';
import { Delete, EmojisPicker as EmojisPickerIcon, Reply } from 'src/components/icons';
import { ToolTip } from 'src/components/common';
import { Ban } from 'src/components/icons';

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

type Props = {
  onReplyClicked: () => void;
  onReactToMessage: (e: EmojiReaction) => void;
  onDeleteMessage: () => void;
  onMuteUser: () => void;
  message: Message;
  className?: string;
  isAdmin: boolean;
  isOwn: boolean;
}

const ActionsWrapper: FC<Props> = ({
  className,
  isAdmin,
  isOwn,
  onDeleteMessage,
  onMuteUser,
  onReactToMessage,
  onReplyClicked
}) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerIconRef = useRef<HTMLDivElement>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [style, setStyle] = useState({});

  const listener = useCallback<(event: MouseEvent | TouchEvent) => void>((event) => {
    if (
      event.target instanceof Node && (
        pickerIconRef.current?.contains(event.target) ||
        pickerRef.current?.contains(event.target)
      )
    ) {
      return;
    }
    setPickerVisible(false);
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [listener, pickerRef]);

  const adjustPickerPosition = useCallback(() => {
    const messagesContainerElement = document.getElementById(
      'messagesContainer'
    );
    if (pickerIconRef.current && messagesContainerElement) {
      const tempStyle: CSSProperties = {};
      const eleRect = pickerIconRef.current.getBoundingClientRect();
      const targetRect = messagesContainerElement.getBoundingClientRect();
      const bottom = targetRect.bottom - eleRect.bottom;
      const availableBottom = bottom + eleRect.height;
      const t = availableBottom >= 320 ? 0 : availableBottom - 320;
      tempStyle.top = `${t}px`;
      setStyle(tempStyle);
    }
  }, []);

  useEffect(() => {
    adjustPickerPosition();
  }, [adjustPickerPosition, pickerVisible]);

  const onSelect = useCallback((e: BaseEmoji) => {
    onReactToMessage({
      emoji: e.native,
      userName: 'No one'
    });
  }, [onReactToMessage]);

  return (
    <div className={cn(s.actionsWrapper, className)}>
      {isAdmin && !isOwn && (
        <Ban
          onClick={onMuteUser}
        />
      )}
      {(isOwn || isAdmin) && (
        <Delete
          onClick={onDeleteMessage}
        />
      )}
      <div ref={pickerIconRef}>
        <EmojisPickerIcon
          onClick={() => {
            setPickerVisible(!pickerVisible);
          }}
        />
      </div>
      <div className='relative inline-block'>
        {pickerVisible && (
          <div
            ref={pickerRef}
            style={{ ...style }}
            className={cn('absolute inline', s.emojisPickerWrapper)}
          >
            <Picker
              data={data}
              previewPosition='none'
              
              onEmojiSelect={onSelect}
            />
          </div>
        )}
      </div>
      <Reply
        onClick={() => {
          onReplyClicked();
        }}
      />
    </div>
  );
};

const ChatMessage: FC<Props> = (props) => {
  const {
    message,
    onReactToMessage,
  } = props;
  const [actionsWrapperVisible, setActionsWrapperVisible] = useState(false);

  return (
    <div
      className={cn('flex items-center', s.root, {
        [s.root__withReply]: !!message.replyToMessage,
        [s.active]: actionsWrapperVisible
      })}
      id={message.id}
      onClick={() => {
        setActionsWrapperVisible(true);
      }}
      onMouseEnter={() => {
        setActionsWrapperVisible(true);
      }}
      onTouchStart={() => {
        setActionsWrapperVisible(true);
      }}
      onMouseLeave={() => {
        setActionsWrapperVisible(false);
      }}
    >
      {typeof message?.status !== 'undefined' &&
        [1, 2, 3].includes(message?.status) &&
          <ActionsWrapper {...props} />
        }

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
                    onClick={() =>
                      onReactToMessage({
                        emoji: emoji,
                        userName: 'No one'
                      })
                    }
                  >
                    <span className='mr-1'>{emoji}</span>
                    <span className={cn(s.emojiCount)}>
                      {message.emojisMap?.get(emoji)?.length}
                    </span>
                  </div>
                );
              })}
            </div>
            {Array.from(message.emojisMap.keys()).map(emoji => {
              const users = message.emojisMap?.get(emoji) || [];
              const usersLength = users.length;
              return (
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
                    {usersLength === 1
                      ? users[0] + ' reacted with '
                      : usersLength === 2
                      ? `${users[0]} and ${users[1]} reacted with `
                      : users.slice(0, usersLength - 1).join(', ') +
                        ` and ${users[usersLength - 1]} reacted with `}
                    <span style={{ fontSize: '18px', marginLeft: '4px' }}>
                      {emoji}
                    </span>
                  </p>
                </ToolTip>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
