import { Pin } from 'src/components/icons';
import { useNetworkClient } from '@contexts/network-client-context';
import React, { useCallback, useEffect } from 'react';
import useAsync from 'src/hooks/useAsync';

import ChatMessage from '../ChatMessage/ChatMessage';

import s from './PinnedMessage.module.scss';
import Button from 'src/components/common/Button';
import { useUI } from '@contexts/ui-context';

const PinnedMessage = () => {
  const { openModal, setModalView } = useUI();
  const { fetchPinnedMessages, pinnedMessages, setPinnedMessages } = useNetworkClient();

  const { execute } = useAsync(fetchPinnedMessages);

  useEffect(() => {
    execute().then((msgs) => {
      if (msgs) {
        setPinnedMessages(msgs)
      }
    });
  }, [execute, setPinnedMessages]);

  const openPinnedMessagesModal = useCallback(() => {
    setModalView('VIEW_PINNED_MESSAGES');
    openModal();
  }, [openModal, setModalView])

  return pinnedMessages && pinnedMessages.length > 0 ? (
    <div className={s.pinnedMessageContainer}>
      <div className={s.scrollContainer}>
        <Pin className={s.pin}/>
        <ChatMessage className={s.message} message={pinnedMessages[pinnedMessages.length - 1]} />
      </div>
      <div className='text-right px-4 pb-2 pt-1'>
        <Button
          onClick={openPinnedMessagesModal}
          size='sm'
          className={s.button}>
          View {pinnedMessages.length - 1} more...
        </Button>
      </div>
    </div>
  ) : null;
}

export default PinnedMessage;
