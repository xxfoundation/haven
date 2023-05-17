
import type { Message } from '@types';
import { FC, HTMLAttributes } from 'react';

import React, { useMemo } from 'react';
import moment from 'moment';
import _ from 'lodash';
import cn from 'classnames';

import MessageContainer from '../MessageContainer';
import { byEntryTimestamp } from 'src/utils/index';

import s from './MessagesContainer.module.scss';

type Props = HTMLAttributes<HTMLDivElement> & {
  readonly?: boolean;
  messages: Message[];
  handleReplyToMessage?: (message: Message) => void;
}

const MessagesContainer: FC<Props> = ({
  readonly = false,
  handleReplyToMessage = () => {},
  messages,
  ...props
}) => {
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
    <div data-testid='messages-container'>
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
              handleReplyToMessage={handleReplyToMessage}
              message={m} />
          ))}
        </div>
      ))}
      {props.children}
    </div>
  );
}

export default MessagesContainer;
