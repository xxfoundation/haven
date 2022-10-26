import { FC, useState } from "react";
import s from "./ExportCodenameView.module.scss";
import { ModalCtaButton } from "@components/common";
import cn from "classnames";
import { useNetworkClient } from "contexts/network-client-context";
import { useUI } from "contexts/ui-context";

const ExportCodenameView: FC<{}> = ({}) => {
  const { closeModal } = useUI();
  const { exportPrivateIdentity } = useNetworkClient();
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    setError("");
    if (password.length) {
      const result = exportPrivateIdentity(password);
      if (result) {
        closeModal();
      } else {
        setError("Incorrect password");
      }
    }
  };
  return (
    <div
      className={cn("w-full flex flex-col justify-center items-center", s.root)}
    >
      <h2 className="mt-9 mb-4">Export codename</h2>
      <p className="mb-8">
        You can export your codename for backup or to use your codename on a
        second device.
      </p>
      <input
        type="password"
        placeholder="Unlock export with your password"
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
      <ModalCtaButton
        buttonCopy="Export"
        cssClass={cn("mt-5", s.button)}
        onClick={handleSubmit}
      />
    </div>
  );
};

export default ExportCodenameView;
