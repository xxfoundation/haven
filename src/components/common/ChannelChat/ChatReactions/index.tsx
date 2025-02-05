import { Message, MessageStatus } from '../../../../types';

import React, { FC, useCallback, useMemo } from 'react';
import { Tooltip } from 'react-tooltip';
import { uniqueId } from 'lodash';
import { useTranslation } from 'react-i18next';

import * as messages from 'src/store/messages';
import * as identity from 'src/store/identity';
import * as app from 'src/store/app';
import { useAppSelector } from 'src/store/hooks';
import { useNetworkClient } from '@contexts/network-client-context';
import Identity from 'src/components/common/Identity';
import Spinner from '@components/common/Spinner';
import { EmojiPicker } from '@components/common/EmojiPortal';

type Props = {
  message: Message;
};

const ChatReactions: FC<Props> = ({ message }) => {
  const { t } = useTranslation();
  const { deleteMessage, sendReaction } = useNetworkClient();
  const userPubkey = useAppSelector(identity.selectors.identity)?.pubkey;
  const currentChannelId = useAppSelector(app.selectors.currentChannelOrConversationId);
  const reactions = useAppSelector(messages.selectors.reactionsTo(message));
  const id = useMemo(() => uniqueId(), []);

  const toggleReaction = useCallback(
    (emoji: string, reactingTo: string) => {
      const currentReactions = reactions.find(([e]) => e === emoji);
      const userReaction = currentReactions?.[1]?.find((r) => r.pubkey === userPubkey);

      if (
        userReaction &&
        currentChannelId !== null &&
        userReaction.status === MessageStatus.Delivered
      ) {
        deleteMessage({ id: userReaction.id, channelId: currentChannelId });
      } else {
        sendReaction(emoji, reactingTo);
      }
    },
    [currentChannelId, deleteMessage, reactions, sendReaction, userPubkey]
  );

  return (
    <>
      <div className="relative flex items-center flex-wrap mt-2 space-x-1">
        {reactions?.map(
          ([emoji, reactionInfos]) =>
            reactionInfos?.length > 0 && (
              <div
                key={`${id}-${message.id}-${emoji}`}
                id={`${id}-${message.id}-${emoji}-emojis-users-reactions`}
                className={`
                  mr-0.5 px-1.5 rounded-[10px] flex items-center text-base cursor-pointer
                  hover:bg-charcoal-3
                  ${reactionInfos.map((i) => i.pubkey).includes(userPubkey ?? '') 
                    ? 'bg-primary-15 border border-primary' 
                    : ''}
                `}
                onClick={() => toggleReaction(emoji, message.id)}
              >
                <span className="mr-1">{emoji}</span>
                <span className="text-[10px]">{reactionInfos.length}</span>
                {reactionInfos.filter((i) => i.status !== MessageStatus.Delivered).length > 0 && (
                  <Spinner size='xs' />
                )}
              </div>
            )
        )}
        {reactions.length > 0 && (
          <button className="bg-charcoal-4 text-charcoal-1 hover:text-primary rounded-xl p-1">
            <EmojiPicker
              onSelect={(e) => {
                sendReaction(e, message.id);
              }}
            />
          </button>
        )}
      </div>
      {reactions?.map(([emoji, users]) => (
        <Tooltip
          clickable
          className="!p-1 !pb-2 !opacity-100 !max-w-[320px] !max-h-[350px] overflow-auto rounded"
          key={emoji}
          anchorId={`${id}-${message.id}-${emoji}-emojis-users-reactions`}
          place={'bottom'}
        >
          <div className="text-[48px] text-center">{emoji}</div>
          <p className="text-xs font-medium text-center">
            {users.slice(0, Math.max(1, users.length - 1)).map((u, i) => (
              <>
                {i > 0 && ', '}
                <Identity key={u.pubkey} pubkey={u.pubkey} codeset={u.codeset} />
              </>
            ))}
            {users.length > 1 && (
              <>
                {' '}
                {t('and')} <Identity clickable {...users[users.length - 1]} />
              </>
            )}
          </p>
        </Tooltip>
      ))}
    </>
  );
};

export default ChatReactions;
