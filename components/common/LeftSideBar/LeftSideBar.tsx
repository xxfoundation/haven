import { FC } from "react";
import s from "./LeftSideBar.module.scss";
import cn from "classnames";
import { Collapse } from "@components/common";
import { Elixxir, SpeakEasy, Settings, Plus } from "@components/icons";
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
    getIdentity
  } = useNetworkClient();

  const codeName = getIdentity().Codename;
  let color = getIdentity().Color;
  if (color) {
    color = color.replace("0x", "#");
  }

  const onChannelChange = (ch: IChannel) => {
    setCurrentChannel(ch);
  };

  const collapseTitle = (
    <div className={cn("flex justify-between")}>
      <span>JOINED</span>
      <Plus
        className={cn(s.plus, {
          [s.plus__disabled]: networkStatus !== NetworkStatus.CONNECTED
        })}
        onClick={e => {
          if (e && e.stopPropagation) {
            e.stopPropagation();
          }
          if (networkStatus === NetworkStatus.CONNECTED) {
            setModalView("CREATE_CHANNEL");
            openModal();
          }
        }}
      />
    </div>
  );

  return (
    <div className={cn(s.root, cssClasses)}>
      <div className={s.header}>
        <SpeakEasy />
        {/* <NetworkStatusIcon status={networkStatus} /> */}
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
        <div
          className={cn("flex justify-between items-center", s.settingsWrapper)}
        >
          <div className={cn("mr-2 flex flex-col", s.currentUserWrapper)}>
            <span>You are now connected as</span>
            <span
              style={{ color }}
              className={cn("flex items-center", s.currentUser)}
            >
              <Elixxir style={{ fill: color, width: "10px" }} />
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
          <span>Version 1.0</span>
        </div>
      </div>
    </div>
  );
};

export default LeftSideBar;
