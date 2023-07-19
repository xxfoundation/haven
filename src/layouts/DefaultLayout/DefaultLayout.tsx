import type { WithChildren } from 'src/types';

import React, { FC, useEffect } from 'react';
import { useRouter } from 'next/router';

import { useUI } from 'src/contexts/ui-context';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { useAuthentication } from 'src/contexts/authentication-context';

import AuthenticationUI from './AuthenticationUI';
import NotificationBanner from 'src/components/common/NotificationBanner';
import LeftHeader from 'src/components/common/LeftHeader';

import UpdatesModal from '../../components/modals/UpdatesModal';
import ConnectingDimmer from './ConnectingDimmer';
import useAccountSync, { AccountSyncStatus } from 'src/hooks/useAccountSync';
import { NetworkStatus } from 'src/hooks/useCmix';
import useEvents from 'src/hooks/useEvents';
import useGoogleRemoteStore from 'src/hooks/useGoogleRemoteStore';
import useDropboxRemoteStore from 'src/hooks/useDropboxRemoteStore';
import Spaces from 'src/components/common/Spaces';
import LeftSideBar  from '@components/common/LeftSideBar';
import MainHeader from '@components/common/MainHeader';
import SettingsView from '@components/views/SettingsViews';

import SettingsMenu from '@components/common/SettingsMenu';
import DMs from 'src/components/common/DMs';
import Notices from 'src/components/common/Notices';
import AppModals from 'src/components/modals/AppModals';

const DefaultLayout: FC<WithChildren> = ({ children }) => {
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
  const { openModal, setChannelInviteLink, setModalView, sidebarView } = useUI();

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

  return (
    <>
      <NotificationBanner />
      <UpdatesModal />
      {isAuthenticated ? (
        <>
          <ConnectingDimmer />
          <AppModals />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '21.75rem 1fr',
              gridTemplateRows: '3.75rem 1fr',
              height: '100vh'
            }}
          >
            <LeftHeader className='z-10' />
            <MainHeader className='z-10'  />
            <LeftSideBar  className='overflow-y-auto'  >
              {sidebarView === 'spaces' && (
                <Spaces />
              )}
              {sidebarView === 'dms' && (
                <DMs />
              )}
              {sidebarView === 'settings' && (
                <SettingsMenu />
              )}
            </LeftSideBar>
            <div className='overflow-hidden flex flex-col'>
              <Notices />
              {sidebarView === 'settings' && (
                <SettingsView />
              )}
              {(sidebarView === 'spaces' || sidebarView === 'dms') && (
                <>{children}</>
              )}
            </div>
          </div>
        </>
      ) : (
        <AuthenticationUI />
      )}
    </>
    
  );
};

export default DefaultLayout;
