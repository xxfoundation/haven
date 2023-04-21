import { Message, MessageStatus } from '@types';

import React, { FC, useCallback, useMemo } from 'react';
import cn from 'classnames';
import { Tooltip } from 'react-tooltip';
import { uniqueId } from 'lodash';
import { useTranslation } from 'react-i18next';

import s from './styles.module.scss';
import * as messages from 'src/store/messages';
import * as identity from 'src/store/identity';
import * as app from 'src/store/app';
import { useAppSelector } from 'src/store/hooks';
import { useNetworkClient } from '@contexts/network-client-context';
import Identity from 'src/components/common/Identity';
import Spinner from '@components/common/Spinner';

type Props = {
  message: Message;
}

const ChatReactions: FC<Props> = ({ message }) => {
  const { t } = useTranslation();
  const { deleteMessage, sendReaction } = useNetworkClient();
  const userPubkey = useAppSelector(identity.selectors.identity)?.pubkey;
  const currentChannelId = useAppSelector(app.selectors.currentChannelOrConversationId);
  const reactions = useAppSelector(messages.selectors.reactionsTo(message));
  const id = useMemo(() => uniqueId(), []);

  const toggleReaction = useCallback((emoji: string, reactingTo: string) => {
    const currentReactions = reactions.find(([e]) => e === emoji);
    const userReaction = currentReactions?.[1]?.find((r) => r.pubkey === userPubkey);

    if (userReaction && currentChannelId !== null && userReaction.status === MessageStatus.Delivered) {
      deleteMessage({ id: userReaction.id, channelId: currentChannelId });
    } else {
      sendReaction(emoji, reactingTo);
    }
  }, [currentChannelId, deleteMessage, reactions, sendReaction, userPubkey])

  return (
    <>
      <div className={cn(s.wrapper)}>
        {reactions?.map(([emoji, reactionInfos]) => reactionInfos?.length > 0 && (
          <div
            key={`${id}-${message.id}-${emoji}`}
            id={`${id}-${message.id}-${emoji}-emojis-users-reactions`}
            className={cn(s.emoji)}
            onClick={() => toggleReaction(emoji, message.id)}
          >
            <span className='mr-1'>{emoji}</span>
            <span className={cn(s.count)}>
              {reactionInfos.length}
            </span>
            {reactionInfos.filter((i) => i.status !== MessageStatus.Delivered).length > 0 && (
              <Spinner size='xs' />
            )}
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
              <> {t('and')} <Identity clickable {...users[users.length - 1]} /></> 
            )}
          </p>
        </Tooltip>
      ))}
    </>
  )
}

export default ChatReactions;
