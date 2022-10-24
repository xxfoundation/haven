import { FC, useState, SyntheticEvent } from "react";
import s from "./CreateChannelView.module.scss";
import { ModalCtaButton } from "@components/common";
import cn from "classnames";
import { useNetworkClient } from "contexts/network-client-context";
import { useUI } from "contexts/ui-context";

const CreateChannelView: FC<{}> = ({}) => {
  const { createChannel } = useNetworkClient();
  const { closeModal } = useUI();
  const [channelName, setChannelName] = useState<string>("");
  const [channelDesc, setChannelDesc] = useState<string>("");
  const [error, setError] = useState("");
  const [privacyLevel, setPrivacyLevel] = useState<0 | 2>(2); //0 = public, 1 = private, and 2 = secret

  const handlePrivacyChange = (e: any) => {
    setPrivacyLevel(e.target.value === "public" ? 0 : 2);
  };
  return (
    <div
      className={cn("w-full flex flex-col justify-center items-center", s.root)}
    >
      <h2 className="mt-9 mb-4">Create new Speakeasy</h2>
      <input
        type="text"
        placeholder="Name"
        value={channelName}
        onChange={e => {
          setChannelName(e.target.value);
        }}
      />
      <input
        type="text"
        placeholder="Description"
        className="mt-4"
        value={channelDesc}
        onChange={e => {
          setChannelDesc(e.target.value);
        }}
      />

      <div className={cn("mt-9 flex", s.radioButtonsContainer)}>
        <label className={cn("mr-9", s.container)}>
          <input
            type="radio"
            checked={privacyLevel === 0}
            name="radio"
            value="public"
            onChange={handlePrivacyChange}
          />
          <span className={s.checkmark}></span>
          <span className="headline--sm ml-2">Public</span>
        </label>
        <label className={cn(s.container)}>
          <input
            type="radio"
            checked={privacyLevel === 2}
            name="radio"
            value="secret"
            onChange={handlePrivacyChange}
          />
          <span className={s.checkmark}></span>
          <span className="headline--sm ml-2">Secret</span>
        </label>
      </div>

      <p className="mt-9 mb-6">
        {privacyLevel === 0
          ? `Public Speakeasies are accessible by anyone with just the link. No
        password is needed to join. You can assume everyone knows when you are
        in a public speakeasy`
          : `Secret speakeasies hide everything: their names, descriptions, members, messages, and more. No one knows anything about the speakeasy unless they have the passphrase`}
      </p>
      {error && (
        <div className={"text text--xs mt-2"} style={{ color: "var(--red)" }}>
          {error}
        </div>
      )}
      <ModalCtaButton
        buttonCopy="Create"
        cssClass={cn("mt-5 mb-8", s.button)}
        onClick={() => {
          createChannel(channelName, channelDesc, privacyLevel)
            .then(() => {
              setChannelName("");
              setChannelDesc("");
              closeModal();
            })
            .catch((error: any) => {
              setError("Something wrong happened, please check your details.");
            });
        }}
      />
    </div>
  );
};

export default CreateChannelView;
