import type { WithChildren } from 'src/types';

import cn from 'classnames';
import React, { FC, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';

import { LeftSideBar, RightSideBar } from 'src/components/common';
import Modal from 'src/components/modals/Modal';
import { ModalViews, useUI } from 'src/contexts/ui-context';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { useAuthentication } from 'src/contexts/authentication-context';
import AuthenticationUI from './AuthenticationUI';
import NotificationBanner from 'src/components/common/NotificationBanner';

import {
  CreateChannelView,
  ClaimAdminKeys,
  LoadingView,
  JoinChannelView,
  ShareChannelView,
  LeaveChannelConfirmationView,
  NickNameSetView,
  ChannelSettingsView,
  SettingsView,
  ExportCodenameView,
  NetworkNotReadyView,
  JoinChannelSuccessView,
  LogoutView,
  UserWasMuted,
  ViewPinnedMessages,
  ExportAdminKeys
} from 'src/components/modals';

import s from './DefaultLayout.module.scss';
import ViewMutedUsers from '@components/modals/ViewMutedUsers';
import UpdatesModal from '../../components/modals/UpdatesModal';
import SecretModal from './SecretModal';
import useToggle from 'src/hooks/useToggle';
import ConnectingDimmer from './ConnectingDimmer';
import UserInfoDrawer from '@components/common/UserInfoDrawer';
import AccountSyncView from '@components/modals/AccountSync';
import useAccountSync, { AccountSyncStatus } from 'src/hooks/useAccountSync';
import { NetworkStatus } from 'src/hooks/useCmix';
import useEvents from 'src/hooks/useEvents';

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
    LOADING: <LoadingView />,
    LEAVE_CHANNEL_CONFIRMATION: <LeaveChannelConfirmationView />,
    SET_NICK_NAME: <NickNameSetView />,
    CHANNEL_SETTINGS: <ChannelSettingsView />,
    SETTINGS: <SettingsView />,
    NETWORK_NOT_READY: <NetworkNotReadyView />,
    JOIN_CHANNEL_SUCCESS: <JoinChannelSuccessView />,
    USER_WAS_MUTED: <UserWasMuted />,
    VIEW_MUTED_USERS: <ViewMutedUsers />,
    VIEW_PINNED_MESSAGES: <ViewPinnedMessages />
  }), []);

  return displayModal && modalView && modalView !== 'IMPORT_CODENAME' ? (
    <Modal
      closeable={closeableOverride}
      className={s[modalClass]} onClose={closeModal}>
      {modals[modalView]}
    </Modal>
  ) : null;
};

const DefaultLayout: FC<WithChildren> = ({
  children,
}) => {
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
            <UserInfoDrawer />
            <LeftSideBar cssClasses={s.leftSideBar} />
            <main>{children}</main>
            <RightSideBar
              collapsed={rightSideCollapsed}
              onToggle={toggle}
              cssClasses={s.rightSideBar} />
            <AuthenticatedUserModals />
          </>
        ) : (
          <AuthenticationUI />
        )}
      </div>
    </>
    
  );
};

export default DefaultLayout;
