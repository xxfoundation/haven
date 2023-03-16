import type { FC } from 'react';
import type { Message } from 'src/types';

import { Pin } from 'src/components/icons';
import React, { useCallback } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import s from './PinnedMessage.module.scss';
import Button from 'src/components/common/Button';
import { useUI } from '@contexts/ui-context';
import MessageContainer from '../MessageContainer';

import * as messages from 'src/store/messages';
import { useAppSelector } from 'src/store/hooks';

type Props = {
  handleReplyToMessage: (message: Message) => void;
}

const PinnedMessage: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { openModal, setModalView } = useUI();
  const pinnedMessages = useAppSelector(messages.selectors.currentPinnedMessages);

  const openPinnedMessagesModal = useCallback(() => {
    setModalView('VIEW_PINNED_MESSAGES');
    openModal();
  }, [openModal, setModalView])

  return pinnedMessages && pinnedMessages.length > 0 ? (
    <div className={cn(s.pinnedMessageContainer, 'shadow-xl mb-2 relative')}>
      <Pin className={s.pin}/>
      <div className='grow'>
        <MessageContainer {...props} clamped={true} className={s.message} message={pinnedMessages[pinnedMessages.length - 1]} />
      </div>
      <div className='flex items-end p-2'>
        <Button
          onClick={openPinnedMessagesModal}
          size='sm'
          className={cn(s.button, 'whitespace-nowrap')}>
          {t('View all')} ({pinnedMessages.length})
        </Button>
      </div>
    </div>
  ) : null;
}

export default PinnedMessage;
