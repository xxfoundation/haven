import { FC } from 'react';
import { useAppSelector } from 'src/store/hooks';
import * as channels from 'src/store/channels';
import * as dms from 'src/store/dms';
import { useUI } from '@contexts/ui-context';
import ChannelHeader from '../ChannelHeader';
import Identity from '../Identity';
import Menu from '@components/icons/Menu';

type Props = {
  className?: string;
};

const MainHeader: FC<Props> = ({ className }) => {
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const currentConversation = useAppSelector(dms.selectors.currentConversation);
  const { leftSidebarView: sidebarView } = useUI();

  const handleMenuClick = () => {
    const mobileToggle = document.getElementById('mobileToggle') as HTMLInputElement;
    if (mobileToggle) {
      mobileToggle.checked = false;
    }
  };

  return (
    <div
      className={`
      rounded-tr-[var(--border-radius)]
      bg-[var(--charcoal-4)]
      ${className || ''}
    `}
    >
      {/* Mobile menu button - always visible on mobile */}
      <button
        onClick={handleMenuClick}
        className='md:hidden absolute left-4 top-4 z-10 p-2 hover:opacity-80 transition-opacity'
        aria-label='Open navigation menu'
      >
        <Menu className='w-6 h-6 text-primary' />
      </button>

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
