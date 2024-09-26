import { useUI } from '@contexts/ui-context'
import { FC, useEffect } from 'react';
import { RightSidebarView } from 'src/types/ui';
import UserDetails from './UserDetails';
import SpaceDetails from './SpaceDetails';
import { useAppSelector } from 'src/store/hooks';
import PinnedMessages from './PinnedMessages';
import MutedUsers from './MutedUsers';
import ContributorsView from './Contributors';
import ChannelNotifications from './ChannelNotifications';

const views: Record<RightSidebarView, FC> = {
  'space-details': SpaceDetails,
  'user-details': UserDetails,
  'pinned-messages': PinnedMessages,
  'muted-users': MutedUsers,
  'contributors': ContributorsView,
  'channel-notifications': ChannelNotifications
}

const RightSideBar = () => {
  const { rightSidebarView, setRightSidebarView } = useUI();
  const Component = (rightSidebarView && views[rightSidebarView]) ?? (() => null);

  const selectedUserId = useAppSelector((state) => state.app.selectedUserPubkey);

  useEffect(() => {
    if (selectedUserId) {
      setRightSidebarView('user-details');
    }
  }, [selectedUserId, setRightSidebarView])

  return rightSidebarView && (
    <div className='border-l border-charcoal-4 bg-charcoal-4-40 basis-80 min-w-[21.75rem] overflow-y-auto'>
      <Component />
    </div>
  );
};

export default RightSideBar;