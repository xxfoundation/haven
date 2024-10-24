import { useUI } from '@contexts/ui-context';
import { FC, useEffect } from 'react';
import { RightSidebarView } from 'src/types/ui';
import UserDetails from './UserDetails';
import SpaceDetails from './SpaceDetails';
import { useAppSelector } from 'src/store/hooks';
import PinnedMessages from './PinnedMessages';
import MutedUsers from './MutedUsers';
import ContributorsView from './Contributors';
import ChannelNotifications from './ChannelNotifications';
import cn from 'classnames';

const views: Record<RightSidebarView, FC> = {
  'space-details': SpaceDetails,
  'user-details': UserDetails,
  'pinned-messages': PinnedMessages,
  'muted-users': MutedUsers,
  contributors: ContributorsView,
  'channel-notifications': ChannelNotifications
};

const RightSideBar: FC<{ className?: string }> = ({ className }) => {
  const { rightSidebarView, setRightSidebarView } = useUI();
  const Component = (rightSidebarView && views[rightSidebarView]) ?? (() => null);

  const selectedUserId = useAppSelector((state) => state.app.selectedUserPubkey);

  useEffect(() => {
    if (selectedUserId) {
      setRightSidebarView('user-details');
    }
  }, [selectedUserId, setRightSidebarView]);

  const classes = 'border-l border-charcoal-4 basis-80';
  const classes_mobile = 'order-first w-full fixed left-0 bg-charcoal-4 h-full'; // mobile first
  const classes_md = 'md:min-w-[21.75rem] md:overflow-y-auto md:absolute md:inset-0'; // for devices above medium
  const classes_smdtp = `smdtp:order-none smdtp:bg-charcoal-4-40 smdtp:min-w-[21.75rem] smdtp:overflow-y-auto smdtp:static`; // for devices above large

  return (
    rightSidebarView && (
      <div className={cn(className, classes, classes_mobile, classes_md, classes_smdtp)}>
        <Component />
      </div>
    )
  );
};

export default RightSideBar;
