import { FC } from "react";
import s from "./NetworkStatusIcon.module.scss";
import cn from "classnames";
import { NetworkStatus } from "contexts/network-client-context";

const NetworkStatusIcon: FC<{ status: NetworkStatus }> = ({ status }) => {
  const getStatus = () => {
    switch (status) {
      case NetworkStatus.CONNECTED:
        return "Connected";
      case NetworkStatus.CONNECTING:
        return "Connecting...";
      case NetworkStatus.DISCONNECTED:
        return "Disconnected";
      case NetworkStatus.FAILED:
        return "Failed to connect";
    }
  };
  return (
    <div className={cn("flex items-center")}>
      <div
        className={cn(
          s.bubble,
          { [s.bubble__connected]: status === NetworkStatus.CONNECTED },
          { [s.bubble__connecting]: status === NetworkStatus.CONNECTING },
          { [s.bubble__failed]: status === NetworkStatus.FAILED },
          { [s.bubble__disconnected]: status === NetworkStatus.DISCONNECTED }
        )}
      ></div>
      <span className="ml-2 text--xs">{getStatus()}</span>
    </div>
  );
};

export default NetworkStatusIcon;
