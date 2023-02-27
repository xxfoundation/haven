import type { Message } from '@types';

import React, { FC, useMemo } from 'react';
import cn from 'classnames';
import { Tooltip } from 'react-tooltip';
import { uniqueId } from 'lodash';

import s from './styles.module.scss';
import * as messages from 'src/store/messages';
import { useAppSelector } from 'src/store/hooks';
import { useNetworkClient } from '@contexts/network-client-context';
import Identity from 'src/components/common/Identity';

type Props = {
  message: Message;
}

const ChatReactions: FC<Props> = ({ message }) => {
  const { sendReaction } = useNetworkClient();
  const reactions = useAppSelector(messages.selectors.reactionsTo(message));
  const id = useMemo(() => uniqueId(), []);

  return (
    <>
      <div className={cn(s.wrapper)}>
        {reactions?.map(([emoji, users]) => (
          <div
            key={`${message.id}-${emoji}`}
            id={`${id}-${message.id}-${emoji}-emojis-users-reactions`}
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
      {reactions?.map(([emoji, users]) => (
        <Tooltip
          clickable
          className={s.tooltip}
          key={emoji}
          anchorId={`${id}-${message.id}-${emoji}-emojis-users-reactions`}
          place={'bottom'}
        >
          <div className={cn(s.icon)}>{emoji}</div>
          <p>
            {users.slice(0, Math.max(1, users.length - 1))
              .map((u, i) => <>{i > 0 && ', '}<Identity key={u.pubkey} pubkey={u.pubkey} codeset={u.codeset} /></>)}
            {users.length > 1 && (
              <> and <Identity clickable {...users[users.length - 1]} /></> 
            )}
          </p>
        </Tooltip>
      ))}
    </>
  )
}

export default ChatReactions;
