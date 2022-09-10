import { FC } from "react";
import s from "./ShareChannelView.module.scss";
import cn from "classnames";
import { ModalCtaButton } from "@components/common";

const ShareChannelView: FC<{}> = ({}) => {
  return (
    <div
      className={cn("w-full flex flex-col justify-center items-center", s.root)}
    >
      <h2 className="mt-9 mb-6">Share channel</h2>
      <div>
        <div className={cn("mb-4")}>
          <h4>Channel 1</h4>
          <p className={cn("mt-1 text text--xs")}>
            Description goes here ipsum dolor sit amet, consectetur adipiscing
            elit. Maecenas posuere cursus posuere. Nunc dolor elit, malesuada
            sed dui vitae, euismod dictum elit. Morbi faucibus id nibh eu{" "}
          </p>
        </div>
        <div className={cn("text text--sm mb-2")}>
          <span className="font-bold mr-1">Channel id:</span>
          <span>fdagfiusd435He</span>
        </div>
        <div className={cn("text text--sm")}>
          <span className="font-bold">Channel key:</span>
          <textarea name="" placeholder="Enter channel key"></textarea>
        </div>
      </div>
      <ModalCtaButton buttonCopy="Copy" cssClass="my-7" />
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
