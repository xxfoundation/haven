import type { WithChildren } from 'src/types';
import cn from 'classnames';
import React, { FC, useEffect } from 'react';
import { useRouter } from 'next/router';

import { LeftSideBar, RightSideBar, Modal } from 'src/components/common';
import { useUI } from 'src/contexts/ui-context';
import { useNetworkClient, Channel } from 'src/contexts/network-client-context';

import { useAuthentication } from 'src/contexts/authentication-context';
import { PrivacyLevel, useUtils } from 'src/contexts/utils-context';
import { Loading, ImportCodeNameLoading } from 'src/components/common';

import {
  CreateChannelView,
  JoinChannelView,
  ShareChannelView,
  LeaveChannelConfirmationView,
  NickNameSetView,
  ChannelActionsView,
  SettingsView,
  ExportCodenameView,
  ImportCodenameView,
  NetworkNotReadyView,
  JoinChannelSuccessView,
  MessageLongView,
  LogoutView
} from 'src/components/common/Modal/ModalViews';

import Register from 'src/components/views/Register';
import LoginView from '@components/views/Login';

import s from './DefaultLayout.module.scss';

const AuthenticationUI: FC = () => {
  const { getStorageTag, statePathExists: isStatePathExisted } = useAuthentication();

  if (!isStatePathExisted() || !getStorageTag()) {
    return <Register />;
  } else {
    return <LoginView />;
  }
};

const AuthenticatedUserModals: FC<{ currentChannel?: Channel }> = ({
  currentChannel
}) => {
  const { closeModal, displayModal, modalView } = useUI();
  const classes = modalView.toLowerCase().replace(/_/g, '-');

  const allModals = [
    'SHARE_CHANNEL',
    'CREATE_CHANNEL',
    'JOIN_CHANNEL',
    'LEAVE_CHANNEL_CONFIRMATION',
    'SET_NICK_NAME',
    'CHANNEL_ACTIONS',
    'SETTINGS',
    'EXPORT_CODENAME',
    'NETWORK_NOT_READY',
    'JOIN_CHANNEL_SUCCESS',
    'MESSAGE_LONG',
    'LOGOUT'
  ];
  return displayModal && allModals.includes(modalView) ? (
    <Modal className={classes} onClose={closeModal}>
      {modalView === 'SHARE_CHANNEL' && <ShareChannelView />}
      {modalView === 'CREATE_CHANNEL' && <CreateChannelView />}
      {modalView === 'JOIN_CHANNEL' && <JoinChannelView />}
      {modalView === 'LEAVE_CHANNEL_CONFIRMATION' && (
        <LeaveChannelConfirmationView />
      )}

      {modalView === 'SET_NICK_NAME' && currentChannel && <NickNameSetView />}
      {modalView === 'CHANNEL_ACTIONS' && <ChannelActionsView />}
      {modalView === 'SETTINGS' && <SettingsView />}
      {modalView === 'EXPORT_CODENAME' && <ExportCodenameView />}
      {modalView === 'NETWORK_NOT_READY' && <NetworkNotReadyView />}
      {modalView === 'JOIN_CHANNEL_SUCCESS' && <JoinChannelSuccessView />}
      {modalView === 'MESSAGE_LONG' && <MessageLongView />}
      {modalView === 'LOGOUT' && <LogoutView />}
    </Modal>
  ) : null;
};

const DefaultLayout: FC<WithChildren> = ({
  children,
}) => {
  const router = useRouter();
  const { getStorageTag: getStorageTag, isAuthenticated } = useAuthentication();
  const { shouldRenderImportCodeNameScreen, utilsLoaded } = useUtils();
  const {
    cmix,
    currentChannel,
    getShareUrlType,
    isNetworkHealthy,
    isReadyToRegister
  } = useNetworkClient();
  const { openModal, setChannelInviteLink, setModalView } = useUI();

  useEffect(() => {
    const privacyLevel = getShareUrlType(window.location.href);
    if (
      privacyLevel !== null &&
      cmix &&
      isNetworkHealthy &&
      isAuthenticated &&
      getStorageTag() &&
      isReadyToRegister &&
      window.location.search &&
      [
        PrivacyLevel.Private,
        PrivacyLevel.Secret
      ].includes(privacyLevel)
    ) {
      setChannelInviteLink(window.location.href);
      setModalView('JOIN_CHANNEL');
      openModal();
      router.replace(window.location.pathname);
    }
  }, [
    cmix,
    isAuthenticated,
    isReadyToRegister,
    isNetworkHealthy,
    getStorageTag,
    getShareUrlType,
    setChannelInviteLink,
    setModalView,
    openModal,
    router
  ]);

  const ImportCodeNameModal = () => {
    const { closeModal, displayModal, modalView } = useUI();
    return displayModal && modalView === 'IMPORT_CODENAME' ? (
      <Modal onClose={closeModal}>
        <ImportCodenameView />
      </Modal>
    ) : null;
  };

  return (
    <div className={cn(s.root)}>
      {utilsLoaded ? (
        cmix && isAuthenticated && getStorageTag() && isReadyToRegister ? (
          <>
            <LeftSideBar cssClasses={s.leftSideBar} />
            <main className=''>{children}</main>
            <RightSideBar cssClasses={s.rightSideBar} />
            <AuthenticatedUserModals currentChannel={currentChannel} />
          </>
        ) : shouldRenderImportCodeNameScreen ? (
          <ImportCodeNameLoading />
        ) : (
          <>
            <AuthenticationUI />
            <ImportCodeNameModal />
          </>
        )
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default DefaultLayout;
