import cn from "classnames";
import React, { FC, useEffect } from "react";
import { LeftSideBar, RightSideBar, Modal } from "@components/common";
import { useUI } from "contexts/ui-context";
import { useNetworkClient, IChannel } from "contexts/network-client-context";

import s from "./DefaultLayout.module.scss";
import { useAuthentication } from "contexts/authentication-context";
import { useUtils } from "contexts/utils-context";
import { Loading, ImportCodeNameLoading } from "@components/common";
import { useRouter } from "next/router";

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
} from "@components/common/Modal/ModalViews";

import Register from "components/common/Register";
import LoginView from "components/common/LoginView";

interface Props {
  pageProps: {};
  children: any;
}

const AuthenticationUI: FC = () => {
  const { isStatePathExisted, getStorageTag } = useAuthentication();

  if (!isStatePathExisted() || !getStorageTag()) {
    return <Register />;
  } else {
    return <LoginView />;
  }
};

const AuthenticatedUserModals: FC<{ currentChannel?: IChannel }> = ({
  currentChannel
}) => {
  const { displayModal, closeModal, modalView } = useUI();
  const cn = modalView.toLowerCase().replace(/_/g, "-");

  const allModals = [
    "SHARE_CHANNEL",
    "CREATE_CHANNEL",
    "JOIN_CHANNEL",
    "LEAVE_CHANNEL_CONFIRMATION",
    "SET_NICK_NAME",
    "CHANNEL_ACTIONS",
    "SETTINGS",
    "EXPORT_CODENAME",
    "NETWORK_NOT_READY",
    "JOIN_CHANNEL_SUCCESS",
    "MESSAGE_LONG",
    "LOGOUT"
  ];
  return displayModal && allModals.includes(modalView) ? (
    <Modal className={cn} onClose={closeModal}>
      {modalView === "SHARE_CHANNEL" && <ShareChannelView />}
      {modalView === "CREATE_CHANNEL" && <CreateChannelView />}
      {modalView === "JOIN_CHANNEL" && <JoinChannelView />}
      {modalView === "LEAVE_CHANNEL_CONFIRMATION" && (
        <LeaveChannelConfirmationView />
      )}

      {modalView === "SET_NICK_NAME" && currentChannel && <NickNameSetView />}
      {modalView === "CHANNEL_ACTIONS" && <ChannelActionsView />}
      {modalView === "SETTINGS" && <SettingsView />}
      {modalView === "EXPORT_CODENAME" && <ExportCodenameView />}
      {modalView === "NETWORK_NOT_READY" && <NetworkNotReadyView />}
      {modalView === "JOIN_CHANNEL_SUCCESS" && <JoinChannelSuccessView />}
      {modalView === "MESSAGE_LONG" && <MessageLongView />}
      {modalView === "LOGOUT" && <LogoutView />}
    </Modal>
  ) : null;
};

const DefaultLayout: FC<Props> = ({
  children,
  pageProps: { ...pageProps }
}) => {
  const router = useRouter();
  const { isAuthenticated, getStorageTag } = useAuthentication();
  const { utilsLoaded, shouldRenderImportCodeNameScreen } = useUtils();
  const {
    network,
    currentChannel,
    isReadyToRegister,
    getShareUrlType,
    isNetworkHealthy
  } = useNetworkClient();
  const { setChannelInviteLink, setModalView, openModal } = useUI();

  useEffect(() => {
    if (
      network &&
      isNetworkHealthy &&
      isAuthenticated &&
      getStorageTag() &&
      isReadyToRegister &&
      window.location.search &&
      [0, 2].includes(getShareUrlType(window.location.href))
    ) {
      setChannelInviteLink(window.location.href);
      setModalView("JOIN_CHANNEL");
      openModal();
      router.replace(window.location.pathname);
    }
  }, [
    network,
    isAuthenticated,
    getStorageTag(),
    isReadyToRegister,
    isNetworkHealthy
  ]);

  const ImportCodeNameModal = () => {
    const { displayModal, closeModal, modalView } = useUI();
    return displayModal && modalView === "IMPORT_CODENAME" ? (
      <Modal onClose={closeModal}>
        <ImportCodenameView />
      </Modal>
    ) : null;
  };

  return (
    <div className={cn(s.root)}>
      {utilsLoaded ? (
        network && isAuthenticated && getStorageTag() && isReadyToRegister ? (
          <>
            <LeftSideBar cssClasses={s.leftSideBar} />
            <main className="">{children}</main>
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
