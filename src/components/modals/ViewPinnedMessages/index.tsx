import type { Message } from '@types';

import { FC, useEffect } from 'react';
import cn from 'classnames';

import { Spinner } from 'src/components/common';
import { useNetworkClient } from 'src/contexts/network-client-context';
import useAsync from 'src/hooks/useAsync';
import delay from 'delay';
import MessagesContainer from '@components/common/ChannelChat/MessagesContainer';
import { useUI } from '@contexts/ui-context';

export type MuteUserAction = 'mute' | 'mute+delete';

const ViewPinnedMessages: FC= () => {
  const { setShowPinned } = useUI();
  const {
    fetchPinnedMessages,
    pinMessage,
    pinnedMessages,
    setPinnedMessages
  } = useNetworkClient();

  const unpin = useAsync(async (message: Message) => Promise.all([
    delay(5000),  // delay to let the nodes propagate
    pinMessage(message, true)
  ]));

  const { execute, status } = useAsync(fetchPinnedMessages);

  useEffect(() => {
    execute().then((msgs) => {
      if (msgs) {
        setPinnedMessages(msgs)
      }
    });
  }, [execute, setPinnedMessages]);

  useEffect(() => {
    setShowPinned(true);

    return () => setShowPinned(false);
  }, [setShowPinned]);

  return (
      <>
        {status === 'pending' || unpin.status === 'pending' ? <div className='my-32'><Spinner size='md' /></div> : (
          <>
            <h2 className={cn('mb-8 text-center')}>Pinned Messages</h2>
            <div className='mt-4 pt-8'>
              {pinnedMessages?.length === 0 && <p className='text-center' style={{ color: 'var(--cyan)'}}>
                [There are currently no pinned messages in this channel]
              </p>}
              {pinnedMessages && <MessagesContainer messages={pinnedMessages}/>}
              </div>
          </>
        )}
      </>
  );
};

export default ViewPinnedMessages;
