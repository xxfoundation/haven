import cn from "classnames";
import React, { FC } from "react";
import { LeftSideBar, RightSideBar, Modal } from "@components/common";
import { useUI } from "contexts/ui-context";
import { useNetworkClient, IChannel } from "contexts/network-client-context";

import s from "./DefaultLayout.module.scss";
import { useAuthentication } from "contexts/authentication-context";
import { useUtils } from "contexts/utils-context";
import { Loading, ImportCodeNameLoading } from "@components/common";

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
  MessageLongView
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
    "MESSAGE_LONG"
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
    </Modal>
  ) : null;
};

const DefaultLayout: FC<Props> = ({
  children,
  pageProps: { ...pageProps }
}) => {
  const { isAuthenticated, getStorageTag } = useAuthentication();
  const { utilsLoaded, shouldRenderImportCodeNameScreen } = useUtils();
  const { network, currentChannel, isReadyToRegister } = useNetworkClient();

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
