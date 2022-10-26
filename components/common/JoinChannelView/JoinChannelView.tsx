import { FC, useState } from "react";
import s from "./JoinChannelView.module.scss";
import { ModalCtaButton } from "@components/common";
import cn from "classnames";
import { WarningComponent } from "pages/_app";

const JoinChannelView: FC<{
  channelInfo: any;
  url: string;
  onConfirm: Function;
}> = ({ channelInfo, url, onConfirm }) => {
  const [copy, setCopy] = useState("");
  if (copy.length) {
    return <WarningComponent warning={copy} />;
  }
  return (
    <div
      className={cn("w-full flex flex-col justify-center items-center", s.root)}
    >
      <h2 className="mt-9 mb-6">Join a Speakeasy</h2>
      <div>
        <div className={cn("mb-4")}>
          <h4>{channelInfo?.Name || ""}</h4>
          <p className={cn("mt-2 text text--xs")}>
            {channelInfo?.Description || ""}
          </p>
        </div>
        <div className={cn("text text--sm mb-2")}>
          <span className="font-bold mr-1">Speakeasy id:</span>
          <span>{channelInfo?.ReceptionID || ""}</span>
        </div>
        <div className={cn(s.channelCredentials)}>
          <span className="text--sm font-bold">Speakeasy invite link:</span>
          {<span className={cn("text text--xs")}>{url}</span>}
        </div>
      </div>
      <div className="flex justify-center">
        <ModalCtaButton
          buttonCopy="Join"
          cssClass={cn("mb-7 mt-16 mr-4", s.button)}
          onClick={() => {
            onConfirm();
            setCopy(
              `You have successfully joined!</br> Return to your Speakeasy home tab to continue.</br> You may close this tab.`
            );
          }}
        />
        <ModalCtaButton
          buttonCopy="Cancel"
          cssClass={cn("mb-7 mt-16", s.button)}
          onClick={() => {
            setCopy(
              "You cancelled joining a new Speakeasy. You may close this tab and return to your Speakeasy home tab."
            );
          }}
        />
      </div>
    </div>
  );
};

export default JoinChannelView;
