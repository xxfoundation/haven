import cn from "classnames";
import React, { FC, useEffect } from "react";
import { LeftSideBar, RightSideBar, Modal } from "@components/common";
import { useRouter } from "next/router";
// import { CommerceProvider } from '@framework'
import { useUI } from "contexts/ui-context";
// import { default as ModalV2 } from '@components/common/Modal'
import s from "./DefaultLayout.module.scss";

import {
  CreateChannelView,
  JoinChannelView,
  ShareChannelView,
  LoginView,
  RegisterView
} from "@components/common/Modal/ModalViews";

interface Props {
  pageProps: {};
}

const DefaultLayout: FC<Props> = ({
  children,
  pageProps: { ...pageProps }
}) => {
  const ModalView: FC<{ modalView: string; closeModal(): any }> = ({
    modalView,
    closeModal
  }) => {
    const {} = useUI();
    const cn = modalView.toLowerCase().replace(/_/g, "-");

    return (
      <Modal className={cn} onClose={closeModal}>
        {modalView === "LOGIN_VIEW" && <LoginView />}
        {modalView === "REGISTERATION_VIEW" && <RegisterView />}
        {modalView === "SHARE_CHANNEL" && <ShareChannelView />}
        {modalView === "CREATE_CHANNEL" && <CreateChannelView />}
        {modalView === "JOIN_CHANNEL" && <JoinChannelView />}
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
