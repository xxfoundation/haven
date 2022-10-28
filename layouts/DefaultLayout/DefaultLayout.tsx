import cn from "classnames";
import React, { FC, useEffect, useState } from "react";
import { LeftSideBar, RightSideBar, Modal } from "@components/common";
import { useUI } from "contexts/ui-context";
import { useNetworkClient } from "contexts/network-client-context";

import s from "./DefaultLayout.module.scss";
import { useAuthentication } from "contexts/authentication-context";
import { useUtils } from "contexts/utils-context";
import { Loading } from "@components/common";
import { dec } from "utils";

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

const DefaultLayout: FC<Props> = ({
  children,
  pageProps: { ...pageProps }
}) => {
  const { isAuthenticated, getStorageTag } = useAuthentication();
  const { utilsLoaded } = useUtils();
  const { network, currentChannel, isReadyToRegister } = useNetworkClient();

  const ModalView: FC<{ modalView: string; closeModal(): any }> = ({
    modalView,
    closeModal
  }) => {
    const cn = modalView.toLowerCase().replace(/_/g, "-");

    return (
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
        {modalView === "IMPORT_CODENAME" && <ImportCodenameView />}
        {modalView === "NETWORK_NOT_READY" && <NetworkNotReadyView />}
        {modalView === "JOIN_CHANNEL_SUCCESS" && <JoinChannelSuccessView />}
        {modalView === "MESSAGE_LONG" && <MessageLongView />}
      </Modal>
    );
  };

  const ModalUI: FC = () => {
    const { displayModal, closeModal, modalView } = useUI();
    return displayModal ? (
      <ModalView modalView={modalView} closeModal={closeModal} />
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
            <ModalUI />
          </>
        ) : (
          <>
            <AuthenticationUI />
            <ModalUI />
          </>
        )
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default DefaultLayout;
