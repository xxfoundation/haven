import { FC } from "react";
import s from "./RegisterView.module.scss";
import { ModalCtaButton } from "@components/common";
import cn from "classnames";

const RegisterView: FC<{}> = ({}) => {
  return (
    <div
      className={cn("w-full flex flex-col justify-center items-center", s.root)}
    >
      <h2 className="mt-9 mb-4">Registration</h2>
      <input type="text" placeholder="Enter your username" className="mt-4" />
      <input type="text" placeholder="Enter your password" className="mt-4" />
      <input type="text" placeholder="Confirm your password" className="mt-4" />
      <ModalCtaButton buttonCopy="Register" cssClass="my-5" />
      <p
        className="mb-16 text text--xs"
        style={{ color: "var(--cyan)", lineHeight: "13px" }}
      >
        !!Warning: Your password cannot be recovered or changed, please make
        sure to keep it safe.
      </p>
    </div>
  );
};

export default RegisterView;
