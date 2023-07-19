import type { WithChildren } from 'src/types';

import cn from 'classnames';
import React, { FC, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';

import { ModalViews, useUI } from 'src/contexts/ui-context';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { useAuthentication } from 'src/contexts/authentication-context';

import AuthenticationUI from './AuthenticationUI';
import NotificationBanner from 'src/components/common/NotificationBanner';
import LeftHeader from 'src/components/common/LeftHeader';

import s from './DefaultLayout.module.scss';
import UpdatesModal from '../../components/modals/UpdatesModal';
import useToggle from 'src/hooks/useToggle';
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


import {
  CreateChannelView,
  ClaimAdminKeys,
  JoinChannelView,
  ShareChannelView,
  LeaveChannelConfirmationView,
  NickNameSetView,
  ExportCodenameView,
  NetworkNotReadyView,
  JoinChannelSuccessView,
  LogoutView,
  UserWasMuted,
  ViewPinnedMessages,
  ExportAdminKeys,
  ViewMutedUsers
} from 'src/components/modals';
import AccountSyncView from '@components/modals/AccountSync';
import Modal from '@components/modals/Modal';
import SettingsMenu from '@components/common/SettingsMenu';
import DMs from 'src/components/common/DMs';
import Notices from '@components/common/Notices';

type ModalMap = Omit<Record<ModalViews, React.ReactNode>, 'IMPORT_CODENAME'>;

const AuthenticatedUserModals: FC = () => {
  const { closeModal, closeableOverride, displayModal, modalView = '' } = useUI();
  const modalClass = modalView?.toLowerCase().replace(/_/g, '-');

  const modals = useMemo<ModalMap>(() => ({
    ACCOUNT_SYNC: <AccountSyncView />,
    CLAIM_ADMIN_KEYS: <ClaimAdminKeys />,
    EXPORT_CODENAME:  <ExportCodenameView />,
    EXPORT_ADMIN_KEYS: <ExportAdminKeys />,
    SHARE_CHANNEL: <ShareChannelView />,
    CREATE_CHANNEL: <CreateChannelView />,
    JOIN_CHANNEL: <JoinChannelView />,
    LOGOUT: <LogoutView />,
    LOADING: <></>,
    LEAVE_CHANNEL_CONFIRMATION: <LeaveChannelConfirmationView />,
    SET_NICK_NAME: <NickNameSetView />,
    CHANNEL_SETTINGS: null,
    SETTINGS: null,
    NETWORK_NOT_READY: <NetworkNotReadyView />,
    JOIN_CHANNEL_SUCCESS: <JoinChannelSuccessView />,
    USER_WAS_MUTED: <UserWasMuted />,
    VIEW_MUTED_USERS: <ViewMutedUsers />,
    VIEW_PINNED_MESSAGES: <ViewPinnedMessages />
  }), []);

  return displayModal && modalView && modalView !== 'IMPORT_CODENAME' ? (
    <Modal
      loading={modalView === 'LOADING'}
      closeable={closeableOverride}
      className={s[modalClass]} onClose={closeModal}>
      {modals[modalView]}
    </Modal>
  ) : null;
};

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
  const { openModal, setChannelInviteLink, setModalView, sidebarView } = useUI();
  const [rightSideCollapsed, { set: setRightSideCollapsed }] = useToggle(false);

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
      <div className={cn(s.root, { [s.collapsed]: rightSideCollapsed } )}>
        {isAuthenticated ? (
          <>
            <ConnectingDimmer />
            <AuthenticatedUserModals />
            <div style={{
              display: 'grid',
              gridTemplateColumns: '21.75rem 1fr',
              gridTemplateRows: '3.75rem 1fr',
              height: '100vh'
            }}>
              <LeftHeader />
              <MainHeader  />
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
              <div className='overflow-hidden'>
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
      </div>
    </>
    
  );
};

export default DefaultLayout;
