import { FC } from "react";
import s from "./LeftSideBar.module.scss";
import cn from "classnames";
import { Collapse, NetworkStatusIcon } from "@components/common";
import { Elixxir, SpeakEasy, Settings, Plus, Join } from "@components/icons";
import { useUI } from "contexts/ui-context";
import {
  useNetworkClient,
  IChannel,
  NetworkStatus
} from "contexts/network-client-context";

const LeftSideBar: FC<{
  cssClasses?: string;
}> = ({ cssClasses }) => {
  const { openModal, setModalView } = useUI();

  const {
    currentChannel,
    channels,
    setCurrentChannel,
    networkStatus,
    getIdentity,
    getVersion,
    getClientVersion
  } = useNetworkClient();

  const codeName = getIdentity().Codename;
  let color = getIdentity().Color;
  if (color) {
    color = color.replace("0x", "#");
  }

  const onChannelChange = (chId: string) => {
    const selectedChannel = channels.find(ch => ch.id === chId);
    setCurrentChannel(selectedChannel);
  };

  const collapseTitle = (
    <div className={cn("flex justify-between")}>
      <span>JOINED</span>

      <div className="flex items-center">
        <Plus
          className={cn("mr-1", s.plus, {
            // [s.plus__disabled]: networkStatus !== NetworkStatus.CONNECTED
          })}
          onClick={(e: any) => {
            if (e && e.stopPropagation) {
              e.stopPropagation();
            }
            // if (networkStatus === NetworkStatus.CONNECTED) {
            setModalView("CREATE_CHANNEL");
            openModal();
            // }
          }}
        />
        <Join
          className={cn(s.join, {
            // [s.join__disabled]: networkStatus !== NetworkStatus.CONNECTED
          })}
          onClick={(e: any) => {
            if (e && e.stopPropagation) {
              e.stopPropagation();
            }
            // if (networkStatus === NetworkStatus.CONNECTED) {
            setModalView("JOIN_CHANNEL");
            openModal();
            // }
          }}
        />
      </div>
    </div>
  );

  return (
    <div className={cn(s.root, cssClasses)}>
      <div className={s.header}>
        <div className={s.logo}>
          <SpeakEasy />
        </div>
        <NetworkStatusIcon />
      </div>
      <div className={s.content}>
        <Collapse title={collapseTitle} defaultActive>
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
                    onChannelChange(ch.id);
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
        <div
          className={cn("flex justify-between items-center", s.settingsWrapper)}
        >
          <div className={cn("mr-2 flex flex-col", s.currentUserWrapper)}>
            <span>You are now connected as</span>
            <span
              style={{ color }}
              className={cn("flex items-center", s.currentUser)}
            >
              <Elixxir
                style={{ fill: color, width: "10px", marginTop: "-3px" }}
              />
              {codeName}
            </span>
          </div>
          <Settings
            style={{ cursor: "pointer" }}
            onClick={() => {
              setModalView("SETTINGS");
              openModal();
            }}
          />
        </div>
        <div className={cn(s.version)}>
          {getClientVersion() && <span>XXDK version {getClientVersion()}</span>}
          {getVersion() && <span>Wasm version {getVersion()}</span>}
          <span>App version 0.1</span>
        </div>
      </div>
    </div>
  );
};

export default LeftSideBar;
