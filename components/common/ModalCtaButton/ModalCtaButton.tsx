import { FC } from "react";
import s from "./ModalCtaButton.module.scss";
import { Button } from "@components/common";

const ModalCtaButton: FC<{ buttonCopy: string; cssClass?: string }> = ({
  buttonCopy,
  cssClass
}) => {
  return (
    <Button
      style={{ backgroundColor: "var(--orange)", border: "none" }}
      cssClasses={cssClass}
    >
      {buttonCopy}
    </Button>
  );
};

export default ModalCtaButton;
