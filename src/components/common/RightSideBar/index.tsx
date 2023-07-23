import { useUI } from '@contexts/ui-context'
import { FC, useEffect } from 'react';
import { RightSidebarView } from 'src/types/ui';
import UserDetails from './UserDetails';
import SpaceDetails from './SpaceDetails';
import { useAppSelector } from 'src/store/hooks';

const views: Record<RightSidebarView, FC> = {
  'space-details': SpaceDetails,
  'user-details': UserDetails
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

  return (
    <div className='border-l border-charcoal-4'>
      <Component />
    </div>
  );
};

export default RightSideBar;