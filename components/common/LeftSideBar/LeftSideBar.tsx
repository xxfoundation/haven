import { FC, useState } from "react";
import s from "./LeftSideBar.module.scss";
import cn from "classnames";
import { Button, Collapse, NetworkStatusIcon } from "@components/common";
import { Elixxir } from "@components/icons";
import { useUI } from "contexts/ui-context";
import {
  useNetworkClient,
  IChannel,
  NetworkStatus
} from "contexts/network-client-context";

const LeftSideBar: FC<{
  cssClasses?: string;
}> = ({ cssClasses }) => {
  const { openModal, closeModal, setModalView } = useUI();

  const {
    currentChannel,
    channels,
    setCurrentChannel,
    networkStatus
  } = useNetworkClient();

  const onChannelChange = (ch: IChannel) => {
    setCurrentChannel(ch);
  };

  return (
    <div className={cn(s.root, cssClasses)}>
      <div className={s.header}>
        <Elixxir />
        <div className={"headline--text mb-3"}>Elixxir Covert Communites</div>
        <NetworkStatusIcon status={networkStatus} />
      </div>
      <div className={s.content}>
        <Collapse title="JOINED" defaultActive>
          <div className="flex flex-col">
            {channels.map(ch => {
              return (
                <span
                  key={ch.id}
                  className={cn(s.channelPill, "headline--xs", {
                    [s.channelPill__active]:
                      ch.id === (currentChannel?.id || "")
                  })}
                  onClick={() => {
                    onChannelChange(ch);
                  }}
                >
                  {ch.name}
                </span>
              );
            })}
          </div>
        </Collapse>
      </div>
      <div className={s.footer}>
        <Button
          cssClasses={"w-full mb-3"}
          onClick={() => {
            setModalView("JOIN_CHANNEL");
            openModal();
          }}
          disabled={networkStatus !== NetworkStatus.CONNECTED}
        >
          Join Channel
        </Button>
        <Button
          cssClasses={"w-full"}
          onClick={() => {
            setModalView("CREATE_CHANNEL");
            openModal();
          }}
          disabled={networkStatus !== NetworkStatus.CONNECTED}
        >
          Create Channel
        </Button>
      </div>
    </div>
  );
};

export default LeftSideBar;
