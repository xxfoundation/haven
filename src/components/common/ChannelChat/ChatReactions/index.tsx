import type { Message } from '@types';

import React, { FC, useMemo } from 'react';
import cn from 'classnames';

import s from './styles.module.scss';
import { ToolTip } from 'src/components/common';

type EmojiReactions = {
  emoji: string;
  users: string[];
}

type Props = {
  onEmojiReaction?: (emoji: string, messageId: string) => void;
  message: Message;
}

const ChatReactions: FC<Props> = ({ message, onEmojiReaction = () => {} }) => {
  const emojiReactions = useMemo<EmojiReactions[] | undefined>(
    () => message.emojisMap && Array.from(message.emojisMap.entries())
      .map(([emoji, users]) => ({ emoji, users })),
    [message.emojisMap]
  );
  
  return (
    <>
      <div className={cn(s.wrapper)}>
        {emojiReactions?.map(({ emoji }) => (
          <div
            key={`${message.id}-${emoji}`}
            data-tip
            data-for={`${message.id}-${emoji}-emojis-users-reactions`}
            className={cn(s.emoji)}
            onClick={() => onEmojiReaction(emoji, message.id)}
          >
            <span className='mr-1'>{emoji}</span>
            <span className={cn(s.count)}>
              {message.emojisMap?.get(emoji)?.length}
            </span>
          </div>
        ))}
      </div>
      {emojiReactions?.map(({ emoji, users }) =>  (
        <ToolTip
          key={emoji}
          tooltipProps={{
            id: `${message.id}-${emoji}-emojis-users-reactions`,
            effect: 'solid',
            place: 'top',
            className: s.tooltip
          }}
        >
          <div className={cn(s.icon)}>{emoji}</div>
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
    </>
  )
}

export default ChatReactions;
