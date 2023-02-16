
import type { Message } from '@types';
import { FC, HTMLAttributes } from 'react';

import React, { useMemo } from 'react';
import moment from 'moment';
import _ from 'lodash';
import cn from 'classnames';

import MessageContainer from '../MessageContainer';
import { Spinner } from 'src/components/common';
import { byEntryTimestamp } from 'src/utils/index';
import * as channels from 'src/store/channels';
import { useAppSelector } from 'src/store/hooks';

import s from './MessagesContainer.module.scss';

type Props = HTMLAttributes<HTMLDivElement> & {
  readonly?: boolean;
  messages: Message[];
  handleReplyToMessage?: (message: Message) => void;
  onEmojiReaction?: (emoji: string, messageId: string) => void;
}

const MessagesContainer: FC<Props> = ({
  readonly = false,
  handleReplyToMessage = () => {},
  messages,
  onEmojiReaction = () => {},
  ...props
}) => {
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  
  const sortedGroupedMessagesPerDay = useMemo(() => {
    const groupedMessagesPerDay = _.groupBy(
      messages,
      (message) => moment(
        moment(message.timestamp),
        'DD/MM/YYYY'
      ).startOf('day')
    );

    return Object.entries(groupedMessagesPerDay)
      .sort(byEntryTimestamp);
  }, [messages]);


  return (
    <>
      {!currentChannel ? (
        <div className='m-auto flex w-full h-full justify-center items-center'>
          <Spinner />
        </div>
      ) : (
        <>
          {sortedGroupedMessagesPerDay.map(([key, message]) => (
            <div className={cn(s.dayMessagesWrapper)} key={key}>
              <div className={s.separator}></div>
              <span className={cn(s.currentDay)}>
                {moment(key).format('dddd MMMM Do, YYYY')}
              </span>
              {message.map((m) => (
                <MessageContainer
                  readonly={readonly}
                  key={m.id}
                  onEmojiReaction={onEmojiReaction}
                  handleReplyToMessage={handleReplyToMessage}
                  message={m} />
              ))}
            </div>
          ))}
        </>
      )}
      {props.children}
    </>
  );
}

export default MessagesContainer;
