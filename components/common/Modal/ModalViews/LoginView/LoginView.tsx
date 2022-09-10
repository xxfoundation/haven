import { FC } from "react";
import s from "./LoginView.module.scss";
import { ModalCtaButton } from "@components/common";
import cn from "classnames";

const LoginView: FC<{}> = ({}) => {
  return (
    <div
      className={cn("w-full flex flex-col justify-center items-center", s.root)}
    >
      <h2 className="mt-9 mb-4">Login</h2>
      <input type="text" placeholder="Enter your password" className="mt-4" />
      <ModalCtaButton buttonCopy="Login" cssClass="mt-5 mb-40" />
    </div>
  );
};

export default LoginView;
