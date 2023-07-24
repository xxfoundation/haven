import type { FC } from 'react';

import { useCallback, useState }  from 'react';
import { useTranslation } from 'react-i18next';

import ChatMessage from '../ChannelChat/ChatMessage/ChatMessage';

import { useAppSelector } from 'src/store/hooks';
import * as messages from 'src/store/messages';
import * as channels from 'src/store/channels';
import { useUI } from '@contexts/ui-context';
import CloseButton from '../CloseButton';
import { useNetworkClient } from '@contexts/network-client-context';
import Spinner from '../Spinner/Spinner';
import { AppEvents, awaitAppEvent } from 'src/events';
import X from '@components/icons/X';
import { Pin } from '@components/icons';
import RightSideTitle from './RightSideTitle';

export type MuteUserAction = 'mute' | 'mute+delete';

const PinnedMessages: FC = () => {
  const { t } = useTranslation();
  const { pinMessage } = useNetworkClient();
  const pinnedMessages = useAppSelector(messages.selectors.currentPinnedMessages);
  const { setRightSidebarView } = useUI();
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const [unpinningIds, setUnpinningIds] = useState<string[]>([]);
  const { alert } = useUI();

  const unpin = useCallback(async (id: string) => {
    setUnpinningIds((ids) => ids.concat(id));
    await pinMessage(id, true);
    await awaitAppEvent(AppEvents.MESSAGE_UNPINNED, (m) => m.id === id)
      .catch(() => {
        alert({
          type: 'error',
          content: t('Failed to unpin message'),
          icon: X
        })
      })
      .then(() => {
        alert({
          type: 'success',
          content: t('Message successfully unpinned'),
          icon: Pin
        })
      })
      .finally(() => {
        setUnpinningIds((ids) => ids.filter((i) => i !== id));
      })
  }, [alert, pinMessage, t])


  return (
    <div className='p-4'>
      <div className='flex justify-between items-center mb-6'>
        <RightSideTitle>
          {t('Pinned Messages')}
        </RightSideTitle>
        <CloseButton className='w-8 h-8' onClick={() => setRightSidebarView(null) } />
      </div>
      <div className='space-y-2'>
        {(!pinnedMessages || pinnedMessages?.length === 0) && (
          <p className='text-charcoal-1'>
            {t('There are currently no pinned messages in this channel')}
          </p>
        )}
        {pinnedMessages?.map((m) => <>
          <div className='relative p-4 rounded-lg bg-our-black hover:bg-charcoal-4'>
            {unpinningIds?.includes(m.id) && (
              <div className='bg-charcoal-4-40 backdrop-blur-sm w-full h-full absolute left-0 top-0 z-10 flex items-center justify-center'>
                <Spinner />
              </div>
            )}
            
            {currentChannel?.isAdmin && (
              <CloseButton
                onClick={() => unpin(m.id)}
                className='absolute right-1 top-1 w-6 h-6' />
            )}
            <ChatMessage
              noReply
              style={{ backgroundColor: 'transparent' }}
              message={m}
              clamped={false} />
          </div>
        </>)}
      </div>
    </div>
  );
};

export default PinnedMessages;
