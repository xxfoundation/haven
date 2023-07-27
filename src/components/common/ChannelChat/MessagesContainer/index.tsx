
import type { Message } from '@types';
import { FC, HTMLAttributes } from 'react';

import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import _ from 'lodash';
import cn from 'classnames';

import MessageContainer from '../MessageContainer';
import { byEntryTimestamp } from 'src/utils/index';

import s from './MessagesContainer.module.scss';

type Props = HTMLAttributes<HTMLDivElement> & {
  readonly?: boolean;
  messages: Message[];
}

const formatDate = (date: string, datetime?: string) => {
  const d = dayjs(date);


  return d.isToday() ? `Today ${dayjs(datetime).format('h A')}` : d.format('YYYY/MM/DD');
}

const MessagesContainer: FC<Props> = ({
  messages,
  readonly = false,
  ...props
}) => {
  const sortedGroupedMessagesPerDay = useMemo(() => {
    const groupedMessagesPerDay = _.groupBy(
      messages,
      (message) => dayjs(
        message.timestamp,
        'DD/MM/YYYY'
      ).startOf('day')
    );

    return Object.entries(groupedMessagesPerDay)
      .sort(byEntryTimestamp);
  }, [messages]);

  return (
    <div data-testid='messages-container'>
      {sortedGroupedMessagesPerDay.map(([key, msgs]) => (
        <div className={cn(s.dayMessagesWrapper)} key={key}>
          <div className='flex items-center my-1'>
            <hr className='border-charcoal-4 w-full' />
            <span className='flex-grow mx-4 whitespace-nowrap text-charcoal-1 text-xs'>
              {formatDate(key, msgs[0]?.timestamp)}
            </span>
            <hr className='border-charcoal-4 w-full' />
          </div>
          {msgs.map((m) => (
            <MessageContainer
              readonly={readonly}
              key={m.id}
              message={m} />
          ))}
        </div>
      ))}
      {props.children}
    </div>
  );
}

export default MessagesContainer;
