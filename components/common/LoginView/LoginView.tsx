import { FC, useState } from "react";
import s from "./LoginView.module.scss";
import { ModalCtaButton } from "@components/common";
import cn from "classnames";
import { useUI } from "contexts/ui-context";
import { useAuthentication } from "contexts/authentication-context";
import { useNetworkClient } from "contexts/network-client-context";

const LoginView: FC<{}> = ({}) => {
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { loadCmix, loadChannelManager } = useNetworkClient();
  const { checkUser, getStorageTag } = useAuthentication();

  return (
    <div
      className={cn("w-full flex flex-col justify-center items-center", s.root)}
    >
      <h2 className="mt-9 mb-4">Login</h2>

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
            console.log("Test actual pass:", password);
            const isRegistered = checkUser(password);
            if (!isRegistered) {
              setError("Invalid credentials.");
            } else {
              loadCmix(password, loadChannelManager(getStorageTag()));
            }
          }}
        />
      </div>
    </div>
  );
};

export default LoginView;
