import type { Message } from '@types';

import React, { FC } from 'react';
import cn from 'classnames';
import { Tooltip } from 'react-tooltip';

import s from './styles.module.scss';
import * as messages from 'src/store/messages';
import { useAppSelector } from 'src/store/hooks';
import { useNetworkClient } from '@contexts/network-client-context';

type Props = {
  message: Message;
}

const ChatReactions: FC<Props> = ({ message }) => {
  const { sendReaction } = useNetworkClient();
  const reactions = useAppSelector(messages.selectors.reactionsTo(message));

  return (
    <>
      <div className={cn(s.wrapper)}>
        {reactions?.map(([emoji, users]) => (
          <div
            key={`${message.id}-${emoji}`}
            id={`${message.id}-${emoji}-emojis-users-reactions`}
            className={cn(s.emoji)}
            onClick={() => sendReaction(emoji, message.id)}
          >
            <span className='mr-1'>{emoji}</span>
            <span className={cn(s.count)}>
              {users.length}
            </span>
          </div>
        ))}
      </div>
      {reactions?.map(([emoji, users]) =>  (
        <Tooltip
          className={s.tooltip}
          key={emoji}
          anchorId={`${message.id}-${emoji}-emojis-users-reactions`}
          place={'top'}
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
        </Tooltip>
      ))}
    </>
  )
}

export default ChatReactions;
