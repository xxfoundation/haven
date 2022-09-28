import { FC } from "react";
import s from "./LeaveChannelConfirmationView.module.scss";
import cn from "classnames";
import { ModalCtaButton } from "@components/common";
import { useNetworkClient } from "contexts/network-client-context";
import { useUI } from "contexts/ui-context";

const LeaveChannelConfirmationView: FC<{}> = ({}) => {
  const { leaveChannel, currentChannel } = useNetworkClient();
  const { closeModal } = useUI();

  return (
    <div
      className={cn("w-full flex flex-col justify-center items-center", s.root)}
    >
      <span className="text font-bold mt-9 mb-4">
        Are you sure you want to leave {currentChannel?.name || ""} channel ?
      </span>

      <div className="flex">
        <ModalCtaButton
          buttonCopy="Leave"
          cssClass="mt-5 mb-10 mr-5"
          onClick={() => {
            leaveChannel();
            closeModal();
          }}
        />

        <ModalCtaButton
          buttonCopy="Cancel"
          cssClass="mt-5 mb-10"
          onClick={() => closeModal()}
        />
      </div>
    </div>
  );
};

export default LeaveChannelConfirmationView;
