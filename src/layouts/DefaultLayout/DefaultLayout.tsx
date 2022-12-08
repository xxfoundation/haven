import type { WithChildren } from 'src/types';
import cn from 'classnames';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import { LeftSideBar, RightSideBar, Modal, ImportCodeNameLoading } from 'src/components/common';
import { useUI } from 'src/contexts/ui-context';
import { useNetworkClient, Channel } from 'src/contexts/network-client-context';

import { useAuthentication } from 'src/contexts/authentication-context';
import { PrivacyLevel, useUtils } from 'src/contexts/utils-context';
import { Loading } from 'src/components/common';
import { encoder } from 'src/utils/index';

import {
  CreateChannelView,
  JoinChannelView,
  ShareChannelView,
  LeaveChannelConfirmationView,
  NickNameSetView,
  ChannelActionsView,
  SettingsView,
  ExportCodenameView,
  NetworkNotReadyView,
  JoinChannelSuccessView,
  MessageLongView,
  LogoutView
} from 'src/components/common/Modal/ModalViews';

import Register from 'src/components/views/Register';
import LoginView from '@components/views/Login';

import s from './DefaultLayout.module.scss';
import { IdentityVariables } from '@components/common/Modal/ModalViews/ImportAccountView/types';
import ImportAccountModal from '@components/common/Modal/ModalViews/ImportAccountView';

const AuthenticationUI: FC = () => {
  const { displayModal, modalView = '' } = useUI();
  const { getStorageTag, statePathExists } = useAuthentication();
  const { utils } = useUtils(); 
  const { checkRegistrationReadiness, initiateCmix, setIsReadyToRegister } = useNetworkClient();
  const [loading, setLoading] = useState(false); 
  const [readyProgress, setReadyProgress] = useState<number>(0);
  const authenticated = statePathExists() && getStorageTag();

  const onSubmit = useCallback(async ({ identity, password }: IdentityVariables) =>  {
    const imported = utils.ImportPrivateIdentity(password, encoder.encode(identity));
    await initiateCmix(password);
    checkRegistrationReadiness(
      imported,
      (isReadyInfo) => {
        // eslint-disable-next-line no-console
        console.log('WE AT ', isReadyInfo?.HowClose);
        setReadyProgress(Math.ceil((isReadyInfo?.HowClose || 0) * 100));
      }
    );
    setIsReadyToRegister(true);
    setLoading(true);
  }, [checkRegistrationReadiness, initiateCmix, setIsReadyToRegister, utils]);

  useEffect(() => {
    if (readyProgress === 100) {
      setLoading(false);
      setReadyProgress(0);
    }
  }, [readyProgress])

  if (loading) {
    return (
      <ImportCodeNameLoading readyProgress={readyProgress}/>
    )
  }

  return (
    <>  
      {displayModal && modalView === 'IMPORT_CODENAME' &&  (
        <ImportAccountModal onSubmit={onSubmit} />
      )}
      {authenticated ? <LoginView /> : <Register />}
    </>
  );
};

const AuthenticatedUserModals: FC<{ currentChannel?: Channel }> = ({
  currentChannel
}) => {
  const { closeModal, displayModal, modalView = '' } = useUI();
  const classes = modalView?.toLowerCase().replace(/_/g, '-');

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
  const { utilsLoaded } = useUtils();
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
        ) : (
          <>
            <AuthenticationUI />
          </>
        )
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default DefaultLayout;
