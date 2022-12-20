import type { Message } from '@types';

import { FC, useEffect, useState } from 'react';
import cn from 'classnames';

import { Spinner } from 'src/components/common';
import { useNetworkClient } from 'src/contexts/network-client-context';
import useAsync from 'src/hooks/useAsync';
import delay from 'delay';
import MessagesContainer from '@components/common/ChannelChat/MessagesContainer';

export type MuteUserAction = 'mute' | 'mute+delete';

const ViewPinnedMessages: FC= () => {
  const { fetchPinnedMessages, pinMessage } = useNetworkClient();
  const { execute, status } = useAsync(fetchPinnedMessages);
  const unpin = useAsync(async (message: Message) => Promise.all([
    delay(5000),  // delay to let the nodes propagate
    pinMessage(message, true)
  ]));

  const [pinnedMessages, setPinnedMessages] = useState<Message[]>();

  useEffect(() => {
    execute().then((messages) => {
      if (messages) {
        setPinnedMessages(messages)
      }
    });
  }, [execute]);

  return (
      <div>
        {status === 'pending' || unpin.status === 'pending' ? <div className='my-32'><Spinner /></div> : (
          <>
            <h2 className={cn('mt-9 mb-8 text-center')}>Pinned Messages</h2>
            <div className='px-4 mt-4 mb-4'>
              {pinnedMessages?.length === 0 && <p style={{ color: 'var(--cyan)'}}>
                [There are currently no pinned messages in this channel]
              </p>}
              {pinnedMessages && <MessagesContainer messages={pinnedMessages}/>}
            </div>
          </>
        )}
      </div>
  );
};

export default ViewPinnedMessages;
