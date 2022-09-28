import cn from "classnames";
import React, { FC, useEffect } from "react";
import { LeftSideBar, RightSideBar, Modal } from "@components/common";
import { useUI } from "contexts/ui-context";
import {
  useNetworkClient,
  NetworkStatus
} from "contexts/network-client-context";

import s from "./DefaultLayout.module.scss";
import { ndf } from "@sdk/ndf";

import {
  CreateChannelView,
  JoinChannelView,
  ShareChannelView,
  LoginView,
  RegisterView,
  LeaveChannelConfirmationView
} from "@components/common/Modal/ModalViews";

interface Props {
  pageProps: {};
}

const DefaultLayout: FC<Props> = ({
  children,
  pageProps: { ...pageProps }
}) => {
  const { setNetworkStatus, setNetwork } = useNetworkClient();
  useEffect(() => {
    const go = new (window as any).Go();
    const binPath = "/integrations/assets/xxdk.wasm";

    setNetworkStatus(NetworkStatus.CONNECTING);
    WebAssembly?.instantiateStreaming(fetch(binPath), go.importObject).then(
      async (result: any) => {
        go?.run(result?.instance);
        // Client specific parameters
        const statePath = "channelPath";
        const statePass = "password";

        // Encodes Uint8Array to a string.
        let enc = new TextEncoder();

        // Decodes a string to a Uint8Array.
        let dec = new TextDecoder();

        const {
          NewCmix,
          LoadCmix,
          GetDefaultCMixParams,
          GenerateChannel,
          NewChannelsManagerDummyNameService
        } = (window as any) || {};

        const statePassEncoded = enc.encode(statePass);
        // Check if state exists
        if (localStorage.getItem(statePath) === null) {
          // Initialize the state
          NewCmix(ndf, statePath, statePassEncoded, "");
        } else {
          console.log("State found at " + statePath);
        }

        let net;
        try {
          net = await LoadCmix(
            statePath,
            statePassEncoded,
            GetDefaultCMixParams()
          );
          setNetwork(net);
        } catch (e) {
          console.error("Failed to load Cmix: " + e);
          return;
        }

        //Set networkFollowerTimeout to a value of your choice (seconds)
        net?.StartNetworkFollower(5000);

        await net.WaitForNetwork(25000).then(
          () => {
            setNetworkStatus(NetworkStatus.CONNECTED);
          },
          () => {
            console.error("Timed out. Network is not healthy.");
            setNetworkStatus(NetworkStatus.FAILED);
            throw new Error("Timed out. Network is not healthy.");
          }
        );
      }
    );
  }, []);
  const ModalView: FC<{ modalView: string; closeModal(): any }> = ({
    modalView,
    closeModal
  }) => {
    const cn = modalView.toLowerCase().replace(/_/g, "-");

    return (
      <Modal className={cn} onClose={closeModal}>
        {modalView === "LOGIN_VIEW" && <LoginView />}
        {modalView === "REGISTERATION_VIEW" && <RegisterView />}
        {modalView === "SHARE_CHANNEL" && <ShareChannelView />}
        {modalView === "CREATE_CHANNEL" && <CreateChannelView />}
        {modalView === "JOIN_CHANNEL" && <JoinChannelView />}
        {modalView === "LEAVE_CHANNEL_CONFIRMATION" && (
          <LeaveChannelConfirmationView />
        )}
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
      <LeftSideBar cssClasses={s.leftSideBar} />
      <main className="">{children}</main>
      <RightSideBar cssClasses={s.rightSideBar} />
      <ModalUI />
    </div>
  );
};

export default DefaultLayout;
