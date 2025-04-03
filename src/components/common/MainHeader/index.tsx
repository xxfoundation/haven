import { FC } from 'react';
import { useAppSelector } from 'src/store/hooks';
import * as channels from 'src/store/channels';
import * as dms from 'src/store/dms';
import { useUI } from '@contexts/ui-context';
import ChannelHeader from '../ChannelHeader';
import Identity from '../Identity';

type Props = {
  className?: string;
};

const MainHeader: FC<Props> = ({ className }) => {
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const currentConversation = useAppSelector(dms.selectors.currentConversation);
  const { leftSidebarView: sidebarView } = useUI();

  return (
    <div
      className={`
      rounded-tr-[var(--border-radius)]
      bg-[var(--charcoal-4)]
      ${className || ''}
    `}
    >
      {currentChannel && sidebarView === 'spaces' && <ChannelHeader {...currentChannel} />}
      {currentConversation && sidebarView === 'dms' && (
        <ChannelHeader
          id={currentConversation.pubkey}
          isAdmin={false}
          name={<Identity {...currentConversation} />}
          privacyLevel={null}
        />
      )}
    </div>
  );
};

export default MainHeader;
