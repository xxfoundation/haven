import { FC, useState } from "react";
import s from "./LoginView.module.scss";
import { ModalCtaButton } from "@components/common";
import cn from "classnames";
import { useUI } from "contexts/ui-context";
import { useAuthentication } from "contexts/authentication-context";

const LoginView: FC<{}> = ({}) => {
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const { setAuthenticationView } = useUI();
  const { checkUser } = useAuthentication();

  return (
    <div
      className={cn("w-full flex flex-col justify-center items-center", s.root)}
    >
      <h2 className="mt-9 mb-4">Login</h2>
      <input
        type="text"
        placeholder="Enter your user name"
        className="mt-4"
        value={userName}
        onChange={e => {
          setUserName(e.target.value);
        }}
      />
      <input
        type="password"
        placeholder="Enter your password"
        className="mt-4"
        value={password}
        onChange={e => {
          setPassword(e.target.value);
        }}
      />
      {error && (
        <div className={"text text--xs mt-2"} style={{ color: "var(--red)" }}>
          {error}
        </div>
      )}
      <div className="mt-6 mb-40 flex flex-col">
        <ModalCtaButton
          buttonCopy="Login"
          cssClass="mb-4"
          onClick={() => {
            setError("");
            const isRegistered = checkUser(userName, password);
            if (!isRegistered) {
              setError("Invalid credentials.");
            }
          }}
        />
        <ModalCtaButton
          buttonCopy="Register"
          onClick={() => {
            setAuthenticationView("REGISTERATION");
          }}
        />
      </div>
    </div>
  );
};

export default LoginView;
