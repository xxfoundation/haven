import type { FC } from 'react';

import { Pin } from 'src/components/icons';
import cn from 'classnames';


import * as messages from 'src/store/messages';
import { useAppSelector } from 'src/store/hooks';
import ChatMessage from '../ChatMessage/ChatMessage';


const PinnedMessage: FC = () => {
  const pinnedMessages = useAppSelector(messages.selectors.currentPinnedMessages);

  return pinnedMessages && pinnedMessages.length > 0 ? (
    <div className={cn('bg-charcoal-4 flex items-center shadow-xl mb-2 border-t-our-black border-t border-b-primary border-b relative')}>
      <Pin className='text-primary ml-2' />
      <div className='grow'>
        <ChatMessage noReply className='bg-charcoal-4' clamped={true} message={pinnedMessages[pinnedMessages.length - 1]} />
      </div>
    </div>
  ) : null;
}

export default PinnedMessage;
