import { FC, useState } from "react";
import s from "./JoinChannelView.module.scss";
import cn from "classnames";
import { ModalCtaButton } from "@components/common";
import { useNetworkClient } from "contexts/network-client-context";
import { useUI } from "contexts/ui-context";

const JoinChannelView: FC<{}> = ({}) => {
  const [channelKey, setChannelKey] = useState<string>("");
  const { joinChannel } = useNetworkClient();
  const { closeModal } = useUI();
  const [error, setError] = useState("");

  return (
    <div
      className={cn("w-full flex flex-col justify-center items-center", s.root)}
    >
      <h2 className="mt-9 mb-4">Join channel</h2>
      <textarea
        name=""
        placeholder="Enter channel key"
        value={channelKey}
        onChange={e => {
          setChannelKey(e.target.value);
        }}
      ></textarea>
      {error && (
        <div className={"text text--xs mt-2"} style={{ color: "var(--red)" }}>
          {error}
        </div>
      )}
      <ModalCtaButton
        buttonCopy="Join"
        cssClass="mt-5 mb-10"
        onClick={() => {
          joinChannel(channelKey)
            .then(() => {
              setChannelKey("");
              closeModal();
            })
            .catch(error => {
              setError("Something wrong happened, please check your details.");
            });
        }}
      />
    </div>
  );
};

export default JoinChannelView;
