import { NextPage } from "next";
import { FC, useEffect, useState } from "react";
import cn from "classnames";
import { useNetworkClient } from "@contexts/network-client-context";
import { useUtils } from "@contexts/utils-context";
import Cookies from "js-cookie";
import { WarningComponent } from "pages/_app";
import JoinChannelView from "@components/common/JoinChannelView";
import { ModalCtaButton } from "@components/common";
import { Spinner } from "@components/common";

import { dec } from "@utils";
import s from "./join.module.scss";

const Join: NextPage = () => {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [withLink, setWithLink] = useState(false);
  const { getShareUrlType } = useNetworkClient();
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [channelType, setChannelType] = useState<null | 0 | 2>(null);
  const { utils, utilsLoaded } = useUtils();
  const [channelInfoJson, setChannelInfoJson] = useState();
  const [channelPrettyPrint, setChannelPrettyPrint] = useState("");
  const [bc, setBc] = useState<BroadcastChannel>(
    new BroadcastChannel("join_channel")
  );

  useEffect(() => {
    if (Cookies.get("userAuthenticated")) {
      setIsUserAuthenticated(true);
    }
    if (window.location.search.length) {
      setWithLink(true);
    }
  }, []);

  useEffect(() => {
    if (isUserAuthenticated && withLink) {
      const urlType = getShareUrlType(window.location.href);
      setChannelType(urlType);
    }
  }, [isUserAuthenticated, withLink, getShareUrlType]);

  useEffect(() => {
    if (channelType === 0 && bc) {
      const channelPrettyPrint = utils.DecodePublicURL(window.location.href);
      const infoJson = JSON.parse(
        dec.decode(utils.GetChannelJSON(channelPrettyPrint))
      );
      setChannelPrettyPrint(channelPrettyPrint);
      setChannelInfoJson(infoJson);
    }
  }, [channelType]);

  if (!utilsLoaded) {
    return (
      <div className={"w-full h-screen flex justify-center items-center"}>
        <Spinner />
      </div>
    );
  }

  return withLink ? (
    isUserAuthenticated ? (
      <>
        {channelInfoJson && window?.location?.href && (
          <JoinChannelView
            channelInfo={channelInfoJson}
            url={window.location.href}
            onConfirm={() => {
              if (channelPrettyPrint && bc) {
                bc.postMessage({
                  prettyPrint: channelPrettyPrint
                });
              }
            }}
          />
        )}
        {!channelInfoJson && window?.location?.href && channelType === 2 && (
          <div className={s.passwordWrapper}>
            <h2 className="mt-9 mb-6">
              This Speakeasy requires a password to join
            </h2>
            <input
              className="mt-3 mb-4"
              name=""
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
              }}
            ></input>
            {error && (
              <div
                className={"text text--xs mt-2 text-center"}
                style={{ color: "var(--red)" }}
              >
                {error}
              </div>
            )}
            <ModalCtaButton
              buttonCopy="Confirm"
              cssClass={cn("mb-7 mt-8 mr-4", s.button)}
              onClick={() => {
                if (password) {
                  try {
                    const channelPrettyPrint = utils.DecodePrivateURL(
                      window.location.href,
                      password
                    );
                    const infoJson = JSON.parse(
                      dec.decode(utils.GetChannelJSON(channelPrettyPrint))
                    );
                    setChannelPrettyPrint(channelPrettyPrint);
                    setChannelInfoJson(infoJson);
                  } catch (error) {
                    setError("Invalid Password");
                  }
                }
              }}
            />
          </div>
        )}
      </>
    ) : (
      <WarningComponent warning="Cannot join a speakeasy, when the user is not logged in. Return to the signup page to create an identity or log in" />
    )
  ) : (
    <WarningComponent warning="Speakeasy app can only run with one tab/window at a time" />
  );
};

export default Join;
// (Join as any).Layout = DefaultLayout;
(Join as any).skipDuplicateTabCheck = true;
