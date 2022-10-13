import { FC, useState, useEffect } from "react";
import s from "./LoginView.module.scss";
import { ModalCtaButton } from "@components/common";
import cn from "classnames";
import { useAuthentication } from "contexts/authentication-context";
import { useNetworkClient } from "contexts/network-client-context";
import {
  NormalSpeakeasy,
  OpenSource,
  NormalHash,
  RoadMap,
  Chat
} from "@components/icons";

const LoginView: FC<{}> = ({}) => {
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { loadCmix, loadChannelManager } = useNetworkClient();
  const { checkUser, getStorageTag } = useAuthentication();

  const handleSubmit = () => {
    setError("");
    const isRegistered = checkUser(password);
    if (!isRegistered) {
      setError("Invalid credentials.");
    } else {
      loadCmix(password, (net: any) =>
        loadChannelManager(getStorageTag(), net)
      );
    }
  };

  return (
    <div className={cn("", s.root)}>
      <div className={cn("w-full flex flex-col", s.wrapper)}>
        <div className={cn(s.header)}>
          <NormalSpeakeasy />
        </div>

        <div className={cn("grid grid-cols-12 gap-0", s.content)}>
          <div className="col-span-9 flex flex-col items-start">
            <span className={cn(s.golden)}>True Freedom</span>
            <span className={cn(s.thick)}>to express yourself,</span>
            <span className={cn(s.golden)}>your thoughts, your beliefs.</span>
            <span className={cn(s.normal)}>
              Speak easily to a group of friends or a global community.{" "}
              <span className={cn(s.highlighted)}>
                Talk about what you want.
              </span>
            </span>
            <span className={cn(s.normal)}>
              Surveillance free. Censorship proof.
              <span className={cn(s.highlighted)}>
                Your speakeasy is yours.
              </span>
            </span>
          </div>
          <div className="col-span-3 pl-3">
            <h2 className="mb-2">Login</h2>

            <p
              className="mb-8 text"
              style={{ color: "#5B5D62", lineHeight: "17px" }}
            >
              Use your password to unlock your speakeasy identity
            </p>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
              }}
              onKeyDown={e => {
                if (e.keyCode === 13) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />

            <div className="flex flex-col mt-4">
              <ModalCtaButton
                buttonCopy="Login"
                cssClass={s.button}
                onClick={handleSubmit}
              />
            </div>
            {error && (
              <div
                style={{
                  color: "var(--red)",
                  marginTop: "14px",
                  fontSize: "11px",

                  textAlign: "center",
                  border: "solid 1px #E3304B",
                  backgroundColor: "rgba(227, 48, 75, 0.1)",
                  padding: "16px"
                }}
              >
                {error}
              </div>
            )}
          </div>
        </div>

        <div className={cn("grid grid-cols-12 gap-0", s.footer)}>
          <div className={cn("flex flex-col col-span-3", s.perkCard)}>
            <OpenSource />
            <span className={cn(s.perkCard__title)}>Open Source</span>
            <span className={cn(s.perkCard__description)}>
              Every line — open source. Forever.
            </span>
          </div>
          <div className={cn("flex flex-col col-span-3", s.perkCard)}>
            <NormalHash />
            <span className={cn(s.perkCard__title)}>
              Fundamentally Different
            </span>
            <span className={cn(s.perkCard__description)}>
              Powered by the first decentralized mixnet-blockchain
            </span>
          </div>
          <div className={cn("flex flex-col col-span-3", s.perkCard)}>
            <RoadMap />
            <span className={cn(s.perkCard__title)}>Roadmap</span>
            <span className={cn(s.perkCard__description)}>
              Building to the future
            </span>
          </div>
          <div className={cn("flex flex-col col-span-3", s.perkCard)}>
            <Chat />
            <span className={cn(s.perkCard__title)}>
              Join the discussion on the official feedback speakeasy
            </span>
          </div>
        </div>
      </div>
      <div className={cn(s.links)}>
        <a href="https://xx.network" target="_blank" rel="noreferrer">
          Join the Discussion
        </a>
        <a href="https://xx.network" target="_blank" rel="noreferrer">
          Contact
        </a>
        <a href="https://xx.network" target="_blank" rel="noreferrer">
          Privacy Policy
        </a>
        <a href="https://xx.network" target="_blank" rel="noreferrer">
          xx network
        </a>
        <a href="https://xx.network" target="_blank" rel="noreferrer">
          xx foundation
        </a>
        <a href="https://xx.network" target="_blank" rel="noreferrer">
          xx messenger
        </a>
        <a href="https://xx.network" target="_blank" rel="noreferrer">
          twitter
        </a>
      </div>
    </div>
  );
};

export default LoginView;
