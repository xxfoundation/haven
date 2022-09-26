import React, { FC, useCallback, useMemo, useState, useEffect } from "react";
import { dec } from "@utils";

export enum NetworkStatus {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  FAILED = "failed"
}

interface INetwork {
  StartNetworkFollower: Function;
  StopNetworkFollower: Function;
  WaitForNetwork: Function;
  GetID: Function;
}

interface IHelperMethods {
  NewCmix: Function;
  LoadCmix: Function;
  GetDefaultCMixParams: Function;
  GenerateChannel: Function;
  GetChannelInfo: Function;
  NewChannelsManagerDummyNameService: Function;
  NewChannelsManagerWithIndexedDbDummyNameService: Function;
}

interface IChannelManager {
  GetChannels: Function;
  GetID: Function;
  JoinChannel: Function;
  LeaveChannel: Function;
  RegisterReceiveHandler: Function;
  ReplayChannel: Function;
  SendAdminGeneric: Function;
  SendGeneric: Function;
  SendMessage: Function;
  SendReaction: Function;
  SendReply: Function;
}

export interface IChannel {
  prettyPrint: string;
  name: string;
  id: string;
  description: string;
}
interface IUser {
  userName: string;
}

export const NetworkClientContext = React.createContext<{
  network?: INetwork;
  networkStatus: NetworkStatus;
  setNetworkStatus: Function;
  setNetwork: Function;
  currentUser?: IUser;
  currentChannel?: IChannel;
  channels: IChannel[];
  setCurrentChannel: Function;
  setCurrentUser: Function;
  joinChannel: Function;
  createChannel: Function;
  shareChannel: Function;
}>({
  network: undefined,
  networkStatus: NetworkStatus.DISCONNECTED,
  setNetworkStatus: () => {},
  setNetwork: () => {},
  currentUser: undefined,
  currentChannel: undefined,
  channels: [],
  setCurrentChannel: () => {},
  setCurrentUser: () => {},
  joinChannel: () => {},
  createChannel: () => {},
  shareChannel: () => {}
});

NetworkClientContext.displayName = "NetworkClientContext";

export const NetworkProvider: FC<any> = props => {
  const [utils, setUtils] = useState<IHelperMethods | undefined>();

  const [network, setNetwork] = useState<INetwork | undefined>();
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(
    NetworkStatus.DISCONNECTED
  );
  const [currentUser, setCurrentUser] = useState<IUser | undefined>();
  const [currentChannel, setCurrentChannel] = useState<IChannel | undefined>();
  const [channels, setChannels] = useState<IChannel[]>([]);
  const [chanManager, setChanManager] = useState<IChannelManager | undefined>();

  // The eventModel is used only without the database
  let eventModel = {
    JoinChannel: function() {
      console.log("Test Join channel");
    },
    LeaveChannel: function() {},
    ReceiveMessage: function() {
      console.log("Test ReceiveMessag:");
    },
    ReceiveReply: function() {},
    ReceiveReaction: function() {},
    UpdateSentStatus: function() {}
  };

  useEffect(() => {
    setUtils({
      NewCmix: ((window as any) || {}).NewCmix,
      GenerateChannel: ((window as any) || {}).GenerateChannel,
      GetChannelInfo: ((window as any) || {}).GetChannelInfo,
      LoadCmix: ((window as any) || {}).LoadCmix,
      GetDefaultCMixParams: ((window as any) || {}).GetDefaultCMixParams,
      NewChannelsManagerDummyNameService: ((window as any) || {})
        .NewChannelsManagerDummyNameService,
      NewChannelsManagerWithIndexedDbDummyNameService: ((window as any) || {})
        .NewChannelsManagerWithIndexedDbDummyNameService
    });
  }, [networkStatus]);

  useEffect(() => {
    if (network && utils) {
      setChanManager(
        utils.NewChannelsManagerDummyNameService(
          network.GetID(),
          "Mostafa",
          eventModel
        )
      );
    }
  }, [utils]);

  const joinChannel = (
    prettyPrint: string,
    appendToCurrent: boolean = true
  ) => {
    if (prettyPrint && chanManager && chanManager.JoinChannel) {
      const chanInfo = JSON.parse(
        dec.decode(chanManager.JoinChannel(prettyPrint))
      );
      if (appendToCurrent) {
        let temp = {
          id: chanInfo?.ChannelID,
          name: chanInfo?.Name,
          description: chanInfo?.Description,
          prettyPrint: prettyPrint
        };
        setCurrentChannel(temp);
        setChannels([...channels, temp]);
      }
    }
  };
  const createChannel = (channelName: string, channelDescription?: string) => {
    if (
      channelName &&
      utils?.GenerateChannel &&
      network &&
      networkStatus === NetworkStatus.CONNECTED
    ) {
      const channelUnparsed = utils?.GenerateChannel(
        network?.GetID(),
        channelName,
        channelDescription || ""
      );
      const channel = JSON.parse(dec.decode(channelUnparsed));
      const channelInfo = getChannelInfo(channel?.Channel || "");
      joinChannel(channel?.Channel, false);
      let temp = {
        id: channelInfo?.ChannelID,
        name: channelInfo?.Name,
        description: channelInfo?.Description,
        prettyPrint: channel?.Channel
      };
      console.log("Test 200 generated channel:", temp);
      setCurrentChannel(temp);
      setChannels([...channels, temp]);
    }
  };
  const shareChannel = () => {};

  const getChannelInfo = (prettyPrint: string) => {
    if (utils && utils.GetChannelInfo && prettyPrint.length) {
      return JSON.parse(dec.decode(utils.GetChannelInfo(prettyPrint)));
    }
    return {};
  };

  return (
    <NetworkClientContext.Provider
      value={{
        network,
        setNetwork,
        networkStatus,
        setNetworkStatus,
        setCurrentUser,
        currentUser,
        joinChannel,
        createChannel,
        shareChannel,
        channels,
        currentChannel,
        setCurrentChannel
      }}
      {...props}
    />
  );
};

export const useNetworkClient = () => {
  const context = React.useContext(NetworkClientContext);
  if (context === undefined) {
    throw new Error(`useNetworkClient must be used within a NetworkProvider`);
  }
  return context;
};

export const ManagedNetworkContext: FC<any> = ({ children }) => (
  <NetworkProvider>{children}</NetworkProvider>
);
