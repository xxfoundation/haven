import { FC, useState } from "react";
import s from "./RegisterView.module.scss";
import { ModalCtaButton } from "@components/common";
import cn from "classnames";
import { useUI } from "contexts/ui-context";
import { useAuthentication } from "contexts/authentication-context";

const RegisterView: FC<{}> = ({}) => {
  const { setAuthenticationView } = useUI();
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { registerUser } = useAuthentication();
  return (
    <div
      className={cn("w-full flex flex-col justify-center items-center", s.root)}
    >
      <h2 className="mt-9 mb-4">Registration</h2>
      <input
        type="text"
        placeholder="Enter your username"
        className="mt-4"
        value={userName}
        onChange={e => {
          setUserName(e.target.value);
        }}
      />
      <input
        type="text"
        placeholder="Enter your password"
        className="mt-4"
        value={password}
        onChange={e => {
          setPassword(e.target.value);
        }}
      />
      {/* <input type="text" placeholder="Confirm your password" className="mt-4" /> */}
      <div className="flex flex-col my-5">
        <ModalCtaButton
          buttonCopy="Register"
          cssClass="mb-4"
          onClick={() => {
            registerUser(userName, password);
          }}
        />
        <ModalCtaButton
          buttonCopy="Login"
          cssClass=""
          onClick={() => {
            setAuthenticationView("LOGIN");
          }}
        />
      </div>

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
