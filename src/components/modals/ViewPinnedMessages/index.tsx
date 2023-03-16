import type { FC } from 'react';

import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import MessagesContainer from '@components/common/ChannelChat/MessagesContainer';

import { useAppSelector } from 'src/store/hooks';
import * as messages from 'src/store/messages';

export type MuteUserAction = 'mute' | 'mute+delete';

const ViewPinnedMessages: FC= () => {
  const { t } = useTranslation();
  const pinnedMessages = useAppSelector(messages.selectors.currentPinnedMessages);

  return (
    <>
      <h2 className={cn('mb-8 text-center')}>
        {t('Pinned Messages')}
      </h2>
      <div className='mt-4 pt-8'>
        {pinnedMessages?.length === 0 && (
          <p className='text-center' style={{ color: 'var(--cyan)'}}>
            [{t('There are currently no pinned messages in this channel')}]
          </p>
        )}
        {pinnedMessages && <MessagesContainer messages={pinnedMessages}/>}
      </div>
    </>
  );
};

export default ViewPinnedMessages;
