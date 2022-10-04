import { FC } from "react";
import s from "./ShareChannelView.module.scss";
import cn from "classnames";
import { ModalCtaButton } from "@components/common";
import { useNetworkClient } from "contexts/network-client-context";

const ShareChannelView: FC<{}> = ({}) => {
  const { currentChannel, getPrettyPrint } = useNetworkClient();
  return (
    <div
      className={cn("w-full flex flex-col justify-center items-center", s.root)}
    >
      <h2 className="mt-9 mb-6">Share channel</h2>
      <div>
        <div className={cn("mb-4")}>
          <h4>{currentChannel?.name || ""}</h4>
          <p className={cn("mt-1 text text--xs")}>
            {currentChannel?.description || ""}
          </p>
        </div>
        <div className={cn("text text--sm mb-2")}>
          <span className="font-bold mr-1">Channel id:</span>
          <span>{currentChannel?.id || ""}</span>
        </div>
        <div className={cn("text text--sm")}>
          <span className="font-bold">Channel key:</span>
          <textarea
            name=""
            value={
              currentChannel?.prettyPrint ||
              getPrettyPrint(currentChannel?.id) ||
              ""
            }
            disabled
          ></textarea>
        </div>
      </div>
      <ModalCtaButton
        buttonCopy="Copy"
        cssClass="my-7"
        onClick={() => {
          navigator.clipboard.writeText(
            currentChannel?.prettyPrint || getPrettyPrint(currentChannel?.id)
          );
        }}
      />
      <p
        className="mb-8 text text--xs"
        style={{ color: "var(--cyan)", lineHeight: "13px" }}
      >
        Warning: With this file anvone can read and send to the channell make
        sure to keen it safe, Consider only sharing it under end-to-end
        connection
      </p>
    </div>
  );
};

export default ShareChannelView;
