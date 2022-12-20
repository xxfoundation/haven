import type { Message } from '@types';

import { FC, useEffect, useState } from 'react';
import cn from 'classnames';

import { ChannelChat, Spinner } from 'src/components/common';
import { useNetworkClient } from 'src/contexts/network-client-context';
import useAsync from 'src/hooks/useAsync';
import delay from 'delay';

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
      <div
        className={cn('w-full p-8 flex flex-col justify-center items-center')}
      >
        {status === 'pending' || unpin.status === 'pending' ? <div className='my-32'><Spinner /></div> : (
          <>
            <h2 className={cn('mt-9 mb-4')}>Warning</h2>
            <p className='mb-4'>
              Unbanning a user will enable them to send messages again.
            </p>
            <div className='px-4 mt-4' style={{ maxHeight: '12rem', overflow: 'auto' }}>
              {pinnedMessages?.length === 0 && <p style={{ color: 'var(--cyan)'}}>
                [There are currently no pinned messages in this channel]
              </p>}
              {pinnedMessages && <ChannelChat messages={pinnedMessages}/>}
            </div>
          </>
        )}
      </div>
  );
};

export default ViewPinnedMessages;
