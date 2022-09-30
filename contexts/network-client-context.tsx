import React, { FC, useState, useEffect } from "react";

import { useAuthentication } from "contexts/authentication-context";
import { useUtils } from "contexts/utils-context";
import { enc, dec } from "@utils";
import { ndf } from "@sdk/ndf";
import { STATE_PATH } from "../constants";

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
  GetStorageTag: Function;
}

export interface IChannel {
  prettyPrint: string;
  name: string;
  id: string;
  description: string;
}

export const NetworkClientContext = React.createContext<{
  network?: INetwork;
  networkStatus: NetworkStatus;
  setNetworkStatus: Function;
  setNetwork: Function;
  currentChannel?: IChannel;
  channels: IChannel[];
  setCurrentChannel: Function;
  joinChannel: Function;
  createChannel: Function;
  shareChannel: Function;
  sendMessage: Function;
  leaveChannel: Function;
  generateIdentitiesObjects: Function;
  isNetworkLoading: boolean;
  connectNetwork: Function;
  initiateCmix: Function;
  loadCmix: Function;
  createChannelManager: Function;
  loadChannelManager: Function;
}>({
  network: undefined,
  networkStatus: NetworkStatus.DISCONNECTED,
  setNetworkStatus: () => {},
  setNetwork: () => {},
  currentChannel: undefined,
  channels: [],
  setCurrentChannel: () => {},
  joinChannel: () => {},
  createChannel: () => {},
  shareChannel: () => {},
  sendMessage: () => {},
  leaveChannel: () => {},
  generateIdentitiesObjects: () => {},
  isNetworkLoading: false,
  connectNetwork: () => {},
  initiateCmix: () => {},
  loadCmix: () => {},
  createChannelManager: () => {},
  loadChannelManager: () => {}
});

NetworkClientContext.displayName = "NetworkClientContext";

export const NetworkProvider: FC<any> = props => {
  console.log("Test contexts: NetworkProvider");
  const {
    isStatePathExisted,
    setStatePath,
    getStorageTag,
    addStorageTag,
    setIsAuthenticated
  } = useAuthentication();
  const { utils } = useUtils();

  const [network, setNetwork] = useState<INetwork | undefined>();
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(
    NetworkStatus.DISCONNECTED
  );
  const [currentChannel, setCurrentChannel] = useState<IChannel | undefined>();
  const [channels, setChannels] = useState<IChannel[]>([]);
  const [chanManager, setChanManager] = useState<IChannelManager | undefined>();
  const [isNetworkLoading, setIsNetworkLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsAuthenticated(true);
    if (network && isNetworkLoading) {
      setIsNetworkLoading(false);
    }
    if (network && networkStatus !== NetworkStatus.CONNECTED) {
      connectNetwork();
    }
  }, [network]);

  const onReceiveEvent = () => {
    console.log("Test received event");
  };

  const loadChannelManager = async (storageTag: string) => {
    if (network && utils && utils.LoadChannelsManagerWithIndexedDb)
      await utils
        .LoadChannelsManagerWithIndexedDb(
          network.GetID(),
          storageTag,
          onReceiveEvent
        )
        .then((res: IChannelManager) => {
          console.log("Test 100 Channel Manager loaded");
          setChanManager(res);
        });
  };

  const createChannelManager = async (privateIdentity: any) => {
    if (network && utils && utils.NewChannelsManagerWithIndexedDb) {
      utils
        .NewChannelsManagerWithIndexedDb(
          network.GetID(),
          privateIdentity,
          onReceiveEvent
        )
        .then((res: IChannelManager) => {
          console.log("Test 100 Channel Manager created");
          setChanManager(res);
          const storageTag = res.GetStorageTag();
          addStorageTag(storageTag);
        });
    }
  };

  const initiateCmix = (password: string) => {
    const statePassEncoded = enc.encode(password);
    // Check if state exists
    if (!isStatePathExisted()) {
      utils.NewCmix(ndf, STATE_PATH, statePassEncoded, "");
      setStatePath();
      console.log("Test 100 created new cmix");
    }
    loadCmix(password);
  };

  const loadCmix = async (password: string, cb?: Function) => {
    const statePassEncoded = enc.encode(password);
    let net;
    setIsNetworkLoading(true);
    try {
      net = await utils.LoadCmix(
        STATE_PATH,
        statePassEncoded,
        utils.GetDefaultCMixParams()
      );
      setNetwork(net);
      if (cb) {
        cb();
      }
      console.log("Test 100 loaded alredy existed cmix", net);
    } catch (e) {
      console.error("Failed to load Cmix: " + e);
      return;
    }
  };

  useEffect(() => {
    if (!currentChannel && channels.length) {
      setCurrentChannel(channels[0]);
    }
  }, [currentChannel]);

  const connectNetwork = async () => {
    if (network) {
      setNetworkStatus(NetworkStatus.CONNECTING);
      network.StartNetworkFollower(5000);
      await network.WaitForNetwork(25000).then(
        () => {
          setNetworkStatus(NetworkStatus.CONNECTED);
        },
        () => {
          console.error("Timed out. Network is not healthy.");
          setNetworkStatus(NetworkStatus.FAILED);
          throw new Error("Timed out. Network is not healthy.");
        }
      );
    }
  };

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

  const leaveChannel = async () => {
    if (currentChannel && chanManager && chanManager.LeaveChannel && utils) {
      try {
        await chanManager.LeaveChannel(
          utils.Base64ToUint8Array(currentChannel.id)
        );
        const temp = currentChannel;
        setCurrentChannel(undefined);
        setChannels(
          channels.filter((c: IChannel) => {
            return c.id != temp.id;
          })
        );
      } catch (error) {
        console.error("Failed to leave Channel.");
      }
    }
  };

  const sendMessage = async (message: string) => {
    if (
      message.length &&
      chanManager &&
      utils &&
      utils.Base64ToUint8Array &&
      currentChannel
    ) {
      await chanManager.SendMessage(
        utils.Base64ToUint8Array(currentChannel.id),
        message,
        30000,
        new Uint8Array(null)
      );
    }
  };

  // Identity object is combination of private identity and code name
  const generateIdentitiesObjects = (n: number) => {
    const identitiesObjects = [];
    console.log("Test 999", network);
    if (utils && utils.GenerateChannelIdentity && network) {
      for (let i = 0; i < n; i++) {
        const privateIdentity = utils.GenerateChannelIdentity(network?.GetID());
        const publicIdentity = utils.GetPublicChannelIdentityFromPrivate(
          privateIdentity
        );
        const identity = JSON.parse(dec.decode(publicIdentity));
        const codeName = identity.Codename;
        identitiesObjects.push({ privateIdentity, codeName });
      }
    }
    return identitiesObjects;
  };

  return (
    <NetworkClientContext.Provider
      value={{
        network,
        setNetwork,
        networkStatus,
        setNetworkStatus,
        joinChannel,
        createChannel,
        shareChannel,
        channels,
        currentChannel,
        setCurrentChannel,
        sendMessage,
        leaveChannel,
        generateIdentitiesObjects,
        isNetworkLoading,
        connectNetwork,
        initiateCmix,
        loadCmix,
        createChannelManager,
        loadChannelManager
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
