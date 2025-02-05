import { Message } from 'src/types';
import { FC, useMemo } from 'react';
import dayjs from 'dayjs';
import MessageContainer from '../MessageContainer';
import { formatDate } from 'src/utils/date';
import _ from 'lodash';

type Props = {
  messages: Message[];
  readonly?: boolean;
  children?: React.ReactNode;
};

const byEntryTimestamp = ([a]: [string, Message[]], [b]: [string, Message[]]) =>
  dayjs(a).isAfter(dayjs(b)) ? 1 : -1;

const MessagesContainer: FC<Props> = ({ messages, readonly = false, ...props }) => {
  const sortedGroupedMessagesPerDay = useMemo(() => {
    const groupedMessagesPerDay = _.groupBy(messages, (message) =>
      dayjs(message.timestamp, 'DD/MM/YYYY').startOf('day')
    );

    return Object.entries(groupedMessagesPerDay).sort(byEntryTimestamp);
  }, [messages]);

  return (
    <div data-testid='messages-container'>
      {sortedGroupedMessagesPerDay.map(([key, msgs]) => (
        <div className="mb-4" key={key}>
          <div className="flex items-center my-1">
            <hr className="border-charcoal-4 w-full" />
            <span className="flex-grow mx-4 whitespace-nowrap text-charcoal-1 text-xs">
              {formatDate(key, msgs[0]?.timestamp)}
            </span>
            <hr className="border-charcoal-4 w-full" />
          </div>
          {msgs.map((m) => (
            <MessageContainer readonly={readonly} key={m.id} message={m} />
          ))}
        </div>
      ))}
      {props.children}
    </div>
  );
};

export default MessagesContainer;
