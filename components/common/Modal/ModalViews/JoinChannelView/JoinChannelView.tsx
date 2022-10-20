import { FC, useState } from "react";
import s from "./JoinChannelView.module.scss";
import cn from "classnames";
import { ModalCtaButton } from "@components/common";
import { useNetworkClient } from "contexts/network-client-context";
import { useUI } from "contexts/ui-context";

const JoinChannelView: FC<{}> = ({}) => {
  const [url, setUrl] = useState<string>("");
  const { getShareUrlType, joinChannelFromURL } = useNetworkClient();
  const { closeModal } = useUI();
  const [error, setError] = useState("");
  const [needPassword, setNeedPassword] = useState(false);
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (url.length === 0) {
      return;
    }

    if (!needPassword) {
      const res = getShareUrlType(url);

      if (res === 0) {
        // Public then we should proceed
        const success = joinChannelFromURL(url);
        if (success) {
          setUrl("");
          closeModal();
        } else {
          setError("Something wrong happened, please check your details.");
        }
      } else if (res === 2) {
        // Secret then needs to capture password
        setNeedPassword(true);
        return;
      } else if (res === 1) {
        // ToDO: Private channel
      } else {
        setError("Something wrong happened, please check your details.");
      }
    } else {
      if (url && password) {
        const success = joinChannelFromURL(url, password);
        if (success) {
          setUrl("");
          setPassword("");
          closeModal();
        } else {
          setError("Something wrong happened, please check your details.");
        }
      }
    }
  };

  return (
    <div
      className={cn("w-full flex flex-col justify-center items-center", s.root)}
    >
      <h2 className="mt-9 mb-4">Join</h2>
      <input
        name=""
        placeholder="Enter url"
        value={url}
        onChange={e => {
          setUrl(e.target.value);
        }}
      ></input>
      {needPassword && (
        <input
          className="mt-3 mb-4"
          name=""
          placeholder="Enter password"
          value={password}
          onChange={e => {
            setPassword(e.target.value);
          }}
        ></input>
      )}

      {error && (
        <div
          className={cn("text text--xs mt-2", s.error)}
          style={{ color: "var(--red)" }}
        >
          {error}
        </div>
      )}
      <ModalCtaButton
        buttonCopy={needPassword ? "Done" : "Go"}
        cssClass={cn("mt-12 mb-10", s.button)}
        onClick={handleSubmit}
      />
    </div>
  );
};

export default JoinChannelView;
