import cn from "classnames";
import React, { FC, useEffect } from "react";
import { LeftSideBar, RightSideBar, Modal } from "@components/common";
import { useUI } from "contexts/ui-context";
import { useNetworkClient } from "contexts/network-client-context";

import s from "./DefaultLayout.module.scss";
import { useAuthentication } from "contexts/authentication-context";
import { useUtils } from "contexts/utils-context";
import { Loading } from "@components/common";

import {
  CreateChannelView,
  JoinChannelView,
  ShareChannelView,
  LeaveChannelConfirmationView,
  NickNameSetView,
  ChannelActionsView,
  SettingsView
} from "@components/common/Modal/ModalViews";

import Register from "components/common/Register";
import LoginView from "components/common/LoginView";

interface Props {
  pageProps: {};
  children: any;
}

const AuthenticationUI: FC = () => {
  const {
    isStatePathExisted,

    getStorageTag
  } = useAuthentication();

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
  const { setUtils, utilsLoaded, setUtilsLoaded } = useUtils();
  const {
    network,
    setNickName,
    currentChannel,
    getNickName
  } = useNetworkClient();

  useEffect(() => {
    if (!utilsLoaded) {
      const go = new (window as any).Go();
      const binPath = "/integrations/assets/xxdk.wasm";
      WebAssembly?.instantiateStreaming(fetch(binPath), go.importObject).then(
        async (result: any) => {
          go?.run(result?.instance);
          const {
            NewCmix,
            GenerateChannel,
            LoadCmix,
            GetChannelInfo,
            GenerateChannelIdentity,
            GetDefaultCMixParams,
            NewChannelsManagerWithIndexedDb,
            Base64ToUint8Array,
            LoadChannelsManagerWithIndexedDb,
            GetPublicChannelIdentityFromPrivate,
            IsNicknameValid,
            LogToFile,
            LogLevel
          } = (window as any) || {};

          setUtils({
            NewCmix,
            GenerateChannel,
            LoadCmix,
            GetChannelInfo,
            GenerateChannelIdentity,
            GetDefaultCMixParams,
            NewChannelsManagerWithIndexedDb,
            Base64ToUint8Array,
            LoadChannelsManagerWithIndexedDb,
            GetPublicChannelIdentityFromPrivate,
            IsNicknameValid
          });

          if (LogLevel) {
            LogLevel(4);
          }
          const logFile = LogToFile(0, "receiver.log", 5000000);
          (window as any).logFile = logFile;
          setUtilsLoaded(true);
        }
      );
    }
  }, [utilsLoaded]);

  useEffect(() => {}, []);
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
        network && isAuthenticated && getStorageTag() ? (
          <>
            <LeftSideBar cssClasses={s.leftSideBar} />
            <main className="">{children}</main>
            <RightSideBar cssClasses={s.rightSideBar} />
            <ModalUI />
          </>
        ) : (
          <AuthenticationUI />
        )
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default DefaultLayout;
