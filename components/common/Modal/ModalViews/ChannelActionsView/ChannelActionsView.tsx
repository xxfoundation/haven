import { FC } from "react";
import s from "./ChannelActionsView.module.scss";
import { ModalCtaButton } from "@components/common";
import cn from "classnames";
import {
  useNetworkClient,
  NetworkStatus
} from "contexts/network-client-context";
import { useUI } from "contexts/ui-context";

const ChannelActionsView: FC<{}> = ({}) => {
  const { currentChannel } = useNetworkClient();
  const { setModalView, openModal } = useUI();

  return (
    <div
      className={cn("w-full flex flex-col justify-center items-center", s.root)}
    >
      <h2 className="mt-9 mb-4">More Channel Actions</h2>

      <div className="mt-6 mb-8 flex items-center mx-auto">
        <ModalCtaButton
          buttonCopy="Join"
          cssClass="mr-8"
          onClick={() => {
            setModalView("JOIN_CHANNEL");
            openModal();
          }}
        />
        <ModalCtaButton
          buttonCopy="Leave"
          cssClass=""
          style={{ borderColor: "var(--red)" }}
          disabled={!currentChannel}
          onClick={() => {
            if (currentChannel) {
              setModalView("LEAVE_CHANNEL_CONFIRMATION");
              openModal();
            }
          }}
        />
      </div>
    </div>
  );
};

export default ChannelActionsView;
