import { FC, useEffect, useState, useRef } from "react";
import s from "./ShareChannelView.module.scss";
import cn from "classnames";
import { ModalCtaButton } from "@components/common";
import { useNetworkClient } from "contexts/network-client-context";
import copy from "copy-to-clipboard";

interface ICredentials {
  url: string;
  password: string;
}

const ShareChannelView: FC<{}> = ({}) => {
  const { currentChannel, getShareURL } = useNetworkClient();
  const [credentials, setCredentials] = useState<ICredentials>({
    url: "",
    password: ""
  });
  const credentialsDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resultCredential: ICredentials = getShareURL();
    if (resultCredential) {
      setCredentials({
        url: resultCredential?.url || "",
        password: resultCredential?.password || ""
      });
    }
  }, []);

  return (
    <div
      className={cn("w-full flex flex-col justify-center items-center", s.root)}
    >
      <h2 className="mt-9 mb-6">Share</h2>
      <div>
        <div className={cn("mb-4")}>
          <h4>{currentChannel?.name || ""}</h4>
          <p className={cn("mt-2 text text--xs")}>
            {currentChannel?.description || ""}
          </p>
        </div>
        <div className={cn("text text--sm mb-2")}>
          <span className="font-bold mr-1">speakeasy id:</span>
          <span>{currentChannel?.id || ""}</span>
        </div>
        <div className={cn(s.channelCredentials)} ref={credentialsDivRef}>
          <span className="text--sm font-bold">speakeasy url:</span>
          {credentials.url.length > 0 && (
            <span className={cn("text text--xs")}>{credentials.url}</span>
          )}
          {credentials.password.length > 0 && (
            <>
              <span className="text--sm font-bold mt-1">
                speakeasy password:
              </span>
              <span className={cn("text text--xs")}>
                {credentials.password}
              </span>
            </>
          )}
        </div>
      </div>
      <ModalCtaButton
        buttonCopy="Copy"
        cssClass={cn("mb-7 mt-16", s.button)}
        onClick={() => {
          if (credentialsDivRef?.current) {
            copy(credentialsDivRef?.current.innerText);
          }
        }}
      />
      <p
        className={cn("mb-8 text text--xs", s.warn)}
        style={{ color: "var(--cyan)", lineHeight: "13px" }}
      >
        Warning: With these credentials anyone can read and send to this
        speakeasy, make sure to keep it safe! Consider only sharing it under
        end-to-end connection.
      </p>
    </div>
  );
};

export default ShareChannelView;
