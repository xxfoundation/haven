import { Trans, useTranslation } from 'react-i18next';
import { FC } from 'react';

import notice from 'src/assets/images/notice.svg';
import { useAppSelector } from 'src/store/hooks';
import * as channels from 'src/store/channels';
import * as messages from 'src/store/messages';
import * as dms from 'src/store/dms';
import { useUI } from '@contexts/ui-context';
import { WithChildren } from '@types';

const Notice: FC<WithChildren> = ({ children }) => (
  <div className='px-6 py-10 flex space-x-2 items-center border-b border-charcoal-4 font-semibold'>
    <img src={notice.src} />
    <span>
      {children}
    </span>
  </div>
);

const Notices = () => {
  const { t } = useTranslation();
  const { sidebarView } = useUI();
  const allChannels = useAppSelector(channels.selectors.channels);
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const msgs = useAppSelector(messages.selectors.currentChannelMessages);
  const conversations = useAppSelector(dms.selectors.conversations);

  return (
    <>
      {(allChannels.length === 0 && sidebarView === 'spaces') && (
        <Notice>
          <Trans t={t}>
            <strong className='text-primary'>Space Chats</strong>&nbsp;will
            show up here once you join or create one.
          </Trans>
        </Notice>
      )}
      {(currentChannel && msgs?.length === 0 && sidebarView === 'spaces') && (
        <Notice>
          <Trans t={t}>
            <strong className='text-primary'>{currentChannel.name}</strong>&nbsp;will
            show up here once you join or create one.
          </Trans>
        </Notice>
      )}
      {(conversations?.length === 0 && sidebarView === 'dms') && (
        <Notice>
          <Trans t={t}>
            <strong className='text-primary'>Direct Messages</strong>&nbsp; will
            show up here once you or somebody else sends you a private message
          </Trans>
        </Notice>
      )}
    </>
  );
}
export default Notices;
