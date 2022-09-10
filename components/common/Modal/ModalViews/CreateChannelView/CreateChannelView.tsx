import { FC } from "react";
import s from "./CreateChannelView.module.scss";
import { ModalCtaButton } from "@components/common";
import cn from "classnames";

const CreateChannelView: FC<{}> = ({}) => {
  return (
    <div
      className={cn("w-full flex flex-col justify-center items-center", s.root)}
    >
      <h2 className="mt-9 mb-4">Create new Channel</h2>
      <input type="text" placeholder="Channel name" />
      <input type="text" placeholder="Channel description" className="mt-4" />
      <ModalCtaButton buttonCopy="Create" cssClass="mt-5 mb-8" />
    </div>
  );
};

export default CreateChannelView;
