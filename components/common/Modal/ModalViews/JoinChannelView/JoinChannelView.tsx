import { FC } from "react";
import s from "./JoinChannelView.module.scss";
import cn from "classnames";
import { ModalCtaButton } from "@components/common";

const JoinChannelView: FC<{}> = ({}) => {
  return (
    <div
      className={cn("w-full flex flex-col justify-center items-center", s.root)}
    >
      <h2 className="mt-9 mb-4">Join channel</h2>
      <textarea name="" placeholder="Enter channel key"></textarea>
      <ModalCtaButton buttonCopy="Join" cssClass="mt-5 mb-10" />
    </div>
  );
};

export default JoinChannelView;
