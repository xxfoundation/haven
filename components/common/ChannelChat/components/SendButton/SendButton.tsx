import { FC } from "react";
import s from "./SendButton.module.scss";
import { Elixxir } from "@components/icons";
import cn from "classnames";

const SendButton: FC<{ cssClass?: string }> = ({ cssClass }) => {
  return (
    <div className={cn(s.root, cssClass)}>
      <span className="mr-1">Send</span>
      <Elixxir />
    </div>
  );
};

export default SendButton;
