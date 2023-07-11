import type { WithChildren } from 'src/types';

import cn from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { useUI } from 'src/contexts/ui-context';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { useAuthentication } from 'src/contexts/authentication-context';

import AuthenticationUI from './AuthenticationUI';
import NotificationBanner from 'src/components/common/NotificationBanner';
import LeftHeader from 'src/components/common/LeftHeader';

import s from './DefaultLayout.module.scss';
import UpdatesModal from '../../components/modals/UpdatesModal';
import SecretModal from './SecretModal';
import useToggle from 'src/hooks/useToggle';
import ConnectingDimmer from './ConnectingDimmer';
import useAccountSync, { AccountSyncStatus } from 'src/hooks/useAccountSync';
import { NetworkStatus } from 'src/hooks/useCmix';
import useEvents from 'src/hooks/useEvents';
import useGoogleRemoteStore from 'src/hooks/useGoogleRemoteStore';
import useDropboxRemoteStore from 'src/hooks/useDropboxRemoteStore';
import { SidebarView } from 'src/types/ui';
import Spaces from 'src/components/common/Spaces';
import LeftSideBar  from '@components/common/LeftSideBar';
import ChannelHeader from '@components/common/ChannelHeader';
import MainHeader from '@components/common/MainHeader';

const DefaultLayout: FC<WithChildren> = ({
  children,
}) => {
  useGoogleRemoteStore();
  useDropboxRemoteStore();
  useEvents();
  const accountSync = useAccountSync();
  const router = useRouter();
  const { isAuthenticated } = useAuthentication();
  const {
    cmix,
    getShareUrlType,
    networkStatus
  } = useNetworkClient();
  const { openModal, setChannelInviteLink, setModalView } = useUI();
  const [rightSideCollapsed, { set: setRightSideCollapsed, toggle }] = useToggle(false);
  const [sidebarView, setSidebarView] = useState<SidebarView>('spaces');

  useEffect(() => {
    const privacyLevel = getShareUrlType(window.location.href);

    if (
      privacyLevel !== null &&
      cmix &&
      networkStatus === NetworkStatus.CONNECTED &&
      isAuthenticated &&
      window.location.search
    ) {
      setChannelInviteLink(window.location.href);
      setModalView('JOIN_CHANNEL');
      openModal();
    }
  }, [
    cmix,
    isAuthenticated,
    networkStatus,
    getShareUrlType,
    setChannelInviteLink,
    setModalView,
    openModal,
    router
  ]);

  useEffect(() => {
    if (networkStatus === NetworkStatus.CONNECTED && isAuthenticated && accountSync.status === AccountSyncStatus.NotSynced) {
      setModalView('ACCOUNT_SYNC', false);
      openModal()
    }
  }, [accountSync.status, isAuthenticated, networkStatus, openModal, setModalView]);

  useEffect(() => {
    const adjustActiveState = () => {
      if (window?.innerWidth <= 760) {
        setRightSideCollapsed(false);
      }
    };

    adjustActiveState();
    window?.addEventListener('resize', adjustActiveState);
    return () => window?.removeEventListener('resize', adjustActiveState);
  }, [setRightSideCollapsed]);


  return (
    <>
      <NotificationBanner />
      <UpdatesModal />
      <SecretModal />
      <div className={cn(s.root, { [s.collapsed]: rightSideCollapsed } )}>
        {isAuthenticated ? (
          <>
            <ConnectingDimmer />
            <div className={s['main-layout']}>
              <LeftSideBar className={s['left-sidebar']}>
                <LeftHeader className={s['left-header']} view={sidebarView} onViewChange={setSidebarView} />
                <div className={s['left-menu']}>
                  {sidebarView === 'spaces' && (
                    <Spaces />
                  )}
                  {sidebarView === 'dms' && (
                    <>suh</>
                  )}
                  {sidebarView === 'settings' && (
                    <>settings</>
                  )}
                </div>
              </LeftSideBar>
              <div className={s['main-screen']}>
                <MainHeader className={s['main-header']} />
              </div>

            </div>
          </>
        ) : (
          <AuthenticationUI />
        )}
      </div>
    </>
    
  );
};

export default DefaultLayout;
