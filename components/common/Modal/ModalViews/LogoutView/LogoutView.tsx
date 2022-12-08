import { FC, useState } from "react";
import s from "./LogoutView.module.scss";
import cn from "classnames";
import { ModalCtaButton } from "@components/common";
import { useNetworkClient } from "contexts/network-client-context";
import { useUI } from "contexts/ui-context";
import { useRouter } from "next/router";

const LogoutView: FC<{}> = ({}) => {
  const router = useRouter();
  const { logout } = useNetworkClient();
  const { closeModal } = useUI();
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (password.length) {
      setError("");
      const result = logout(password);
      if (result) {
        closeModal();
        router.push("/");
      } else {
        setError("Something wrong occured! Please check your details.");
      }
    }
  };

  return (
    <div
      className={cn("w-full flex flex-col justify-center items-center", s.root)}
    >
      <h2 className="mt-9 mb-4">Logout</h2>
      <p className="mb-8">
        Warning: By logging out, all of you current data will be deleted from
        your browser. Please make sure you have a backup first. This can’t be
        undone.
      </p>

      <input
        type="password"
        className="mt-3 mb-4"
        name=""
        placeholder="Enter password"
        value={password}
        onChange={e => {
          setPassword(e.target.value);
        }}
      ></input>

      {error && (
        <div
          className={cn("text text--xs mt-2", s.error)}
          style={{ color: "var(--red)" }}
        >
          {error}
        </div>
      )}
      <ModalCtaButton
        buttonCopy="Confirm"
        cssClass={cn("mt-12 mb-10", s.button)}
        onClick={handleSubmit}
      />
    </div>
  );
};

export default LogoutView;
