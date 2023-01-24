import type { Message } from '@types';

import React, { FC, useMemo } from 'react';
import cn from 'classnames';

import s from './styles.module.scss';
import { ToolTip } from 'src/components/common';
import { useNetworkClient } from '@contexts/network-client-context';

type Props = {
  onEmojiReaction?: (emoji: string, messageId: string) => void;
  message: Message;
}

const ChatReactions: FC<Props> = ({ message, onEmojiReaction = () => {} }) => {
  const { messageReactions } = useNetworkClient();

  const reactions = useMemo(
    () => Object.entries(messageReactions?.[message.id] ?? {})
      .sort((a, b) => b[1].length - a[1].length),
    [message.id, messageReactions]
  );
  
  return (
    <>
      <div className={cn(s.wrapper)}>
        {reactions?.map(([emoji, users]) => (
          <div
            key={`${message.id}-${emoji}`}
            data-tip
            data-for={`${message.id}-${emoji}-emojis-users-reactions`}
            className={cn(s.emoji)}
            onClick={() => onEmojiReaction(emoji, message.id)}
          >
            <span className='mr-1'>{emoji}</span>
            <span className={cn(s.count)}>
              {users.length}
            </span>
          </div>
        ))}
      </div>
      {reactions?.map(([emoji, users]) =>  (
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
