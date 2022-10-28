import React, { FC, useState, useEffect, useCallback, useRef } from "react";

import { useAuthentication } from "contexts/authentication-context";
import { useUtils } from "contexts/utils-context";
import { ndf } from "@sdk/ndf";
import { STATE_PATH } from "../constants";
import { Dexie } from "dexie";
import { IMessage } from "types";
import { enc, dec } from "utils";
import _ from "lodash";
import Cookies from "js-cookie";

const batchCount = 100;

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
  ReadyToSend: Function;
  AddHealthCallback: Function;
  IsReady: Function;
}

interface IDatabaseCipher {
  GetID: Function;
  Decrypt: Function;
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
  SetNickname: Function;
  GetNickname: Function;
  GetIdentity: Function;
  GetShareURL: Function;
  JoinChannelFromURL: Function;
  ExportPrivateIdentity: Function;
}

export interface IChannel {
  prettyPrint?: string;
  name: string;
  id: string;
  description: string;
  isLoading?: boolean;
  withMissedMessages?: boolean;
  currentMessagesBatch?: number;
}

let db: Dexie | undefined;

export const NetworkClientContext = React.createContext<{
  network?: INetwork;
  networkStatus: NetworkStatus;
  setNetworkStatus: Function;
  setNetwork: Function;
  currentChannel?: IChannel;
  channels: IChannel[];
  messages: IMessage[];
  setMessages: Function;
  setCurrentChannel: Function;
  joinChannel: Function;
  createChannel: Function;
  shareChannel: Function;
  sendMessage: Function;
  leaveChannel: Function;
  generateIdentitiesObjects: Function;
  connectNetwork: Function;
  initiateCmix: Function;
  loadCmix: Function;
  createChannelManager: Function;
  loadChannelManager: Function;
  handleInitialLoadData: Function;
  getNickName: Function;
  setNickName: Function;
  getIdentity: Function;
  sendReply: Function;
  sendReaction: Function;
  getPrettyPrint: Function;
  appendSenderMessage: Function;
  getShareURL: Function;
  getShareUrlType: Function;
  joinChannelFromURL: Function;
  getVersion: Function;
  getClientVersion: Function;
  loadMoreChannelData: Function;
  exportPrivateIdentity: Function;
  getCodeNameAndColor: Function;
  isNetworkHealthy: boolean | undefined;
  isReadyToRegister: boolean | undefined;
  setIsReadyToRegister: Function;
  checkIsRedayToRegister: Function;
}>({
  network: undefined,
  networkStatus: NetworkStatus.DISCONNECTED,
  setNetworkStatus: () => {},
  setNetwork: () => {},
  currentChannel: undefined,
  channels: [],
  messages: [],
  setMessages: () => {},
  setCurrentChannel: () => {},
  joinChannel: () => {},
  createChannel: () => {},
  shareChannel: () => {},
  sendMessage: () => {},
  leaveChannel: () => {},
  generateIdentitiesObjects: () => {},
  connectNetwork: () => {},
  initiateCmix: () => {},
  loadCmix: () => {},
  createChannelManager: () => {},
  loadChannelManager: () => {},
  handleInitialLoadData: () => {},
  setNickName: () => {},
  getNickName: () => {},
  getIdentity: () => {},
  sendReply: () => {},
  sendReaction: () => {},
  getPrettyPrint: () => {},
  appendSenderMessage: () => {},
  getShareURL: () => {},
  getShareUrlType: () => {},
  joinChannelFromURL: () => {},
  getVersion: () => {},
  getClientVersion: () => {},
  loadMoreChannelData: () => {},
  exportPrivateIdentity: () => {},
  getCodeNameAndColor: () => {},
  isNetworkHealthy: undefined,
  isReadyToRegister: undefined,
  setIsReadyToRegister: () => {},
  checkIsRedayToRegister: () => {}
});

NetworkClientContext.displayName = "NetworkClientContext";

export const NetworkProvider: FC<any> = props => {
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
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [chanManager, setChanManager] = useState<IChannelManager | undefined>();

  const [isNetworkHealthy, setIsNetworkHealthy] = useState<boolean | undefined>(
    undefined
  );
  const [isReadyToRegister, setIsReadyToRegister] = useState<
    boolean | undefined
  >(undefined);
  const channelsRef = useRef<IChannel[]>([]);
  const blockedEvents = useRef<any[]>([]);
  const currentCodeNameRef = useRef<string>("");
  const currentChannelRef = useRef<IChannel>();
  const [bc, setBc] = useState<BroadcastChannel>(
    new BroadcastChannel("join_channel")
  );

  const dummyTrafficObjRef = useRef<any>(undefined);

  const cipherRef = useRef<IDatabaseCipher>();

  useEffect(() => {
    channelsRef.current = channels;
  }, [channels]);

  useEffect(() => {
    if (currentChannel) {
      currentChannelRef.current = currentChannel;
      setChannels(prev => {
        return prev.map(ch => {
          if (ch?.id === currentChannel?.id) {
            return { ...ch, withMissedMessages: false };
          } else {
            return ch;
          }
        });
      });
    }
  }, [currentChannel]);

  useEffect(() => {
    if (chanManager) {
      currentCodeNameRef.current = getIdentity().Codename;
      Cookies.set("userAuthenticated", "true", { path: "/" });
    }
  }, [chanManager]);

  useEffect(() => {
    bc.onmessage = async event => {
      if (event.data?.prettyPrint) {
        try {
          await joinChannel(event.data.prettyPrint);
        } catch (error) {}
      }
    };
  }, [bc, chanManager]);

  useEffect(() => {
    if (network) {
      setIsAuthenticated(true);
    }

    if (network && networkStatus !== NetworkStatus.CONNECTED) {
      connectNetwork();
    }
  }, [network]);

  const mapDbMessagesToMessages = async (messages: any[]) => {
    if (!db || !(cipherRef && cipherRef.current)) {
      return [];
    } else {
      // const allMessages = await db.table("messages").toArray();
      const messagesParentIds = messages
        .filter(e => e.parent_message_id)
        .map(e => e.parent_message_id);

      const relatedMessages =
        (await db
          .table("messages")
          .where("message_id")
          .anyOf(messagesParentIds)
          .toArray()) || [];

      const mappedMessages: IMessage[] = [];
      messages.forEach((m: any) => {
        if (m.parent_message_id && m.type === 1) {
          const replyToMessage = relatedMessages.find(
            ms => ms.message_id === m.parent_message_id
          );

          // If there is no reply To message Then it is not yet received
          if (!replyToMessage) {
            blockedEvents.current = [...blockedEvents.current, m];
            return;
          }

          const {
            codeName: messageCodeName,
            color: messageColor
          } = getCodeNameAndColor(m.pubkey, m.codeset_version);

          const {
            codeName: replyToMessageCodeName,
            color: replyToMessageColor
          } = getCodeNameAndColor(
            replyToMessage.pubkey,
            replyToMessage.codeset_version
          );

          const resolvedMessage: IMessage = {
            id: m.message_id,
            body: dec.decode(
              cipherRef?.current?.Decrypt(utils.Base64ToUint8Array(m.text))
            ),
            timestamp: m.timestamp,
            codeName: messageCodeName,
            nickName: m.nickname || "",
            color: messageColor,
            channelId: m.channel_id,
            status: m.status,
            uuid: m.id,
            round: m.round,
            replyToMessage: {
              id: replyToMessage.message_id,
              body: dec.decode(
                cipherRef?.current?.Decrypt(
                  utils.Base64ToUint8Array(replyToMessage.text)
                )
              ),
              timestamp: replyToMessage.timestamp,
              codeName: replyToMessageCodeName,
              nickName: replyToMessage.nickname || "",
              color: replyToMessageColor,
              channelId: replyToMessage.channel_id,
              status: replyToMessage.status,
              uuid: replyToMessage.id,
              round: replyToMessage.round
            }
          };
          mappedMessages.push(resolvedMessage);
        } else if (!m.parent_message_id) {
          // This is normal message
          const {
            codeName: messageCodeName,
            color: messageColor
          } = getCodeNameAndColor(m.pubkey, m.codeset_version);
          const resolvedMessage: IMessage = {
            id: m.message_id,
            body: dec.decode(
              cipherRef?.current?.Decrypt(utils.Base64ToUint8Array(m.text))
            ),
            timestamp: m.timestamp,
            codeName: messageCodeName,
            nickName: m.nickname || "",
            color: messageColor,
            channelId: m.channel_id,
            status: m.status,
            uuid: m.id,
            round: m.round
          };
          mappedMessages.push(resolvedMessage);
        }
      });
      return mappedMessages;
    }
  };

  const handleReactionReceived = (dbMessage: any) => {
    setMessages(prevMessages => {
      const destinationMessage = prevMessages.find(
        m => m.id === dbMessage.parent_message_id
      );
      if (destinationMessage) {
        const temp = destinationMessage;
        // const emoji = dbMessage.text;
        const emoji = dec.decode(
          cipherRef?.current?.Decrypt(utils.Base64ToUint8Array(dbMessage.text))
        );

        const { codeName } = getCodeNameAndColor(
          dbMessage.pubkey,
          dbMessage.codeset_version
        );
        // const codeName = dbMessage.codename;
        // If no emojis map set it.
        if (!temp.emojisMap) {
          temp.emojisMap = new Map();
        }

        // If no key for this reaction set it with this username as the value
        if (!temp.emojisMap.has(emoji)) {
          temp.emojisMap.set(emoji, [codeName]);
        } else {
          const previousInteractedUsers = temp.emojisMap.get(emoji) || [];
          // If emojisMap has this same interaction for this user before then delete it
          if (previousInteractedUsers?.includes(codeName)) {
            // const updatedInteractedUsers = previousInteractedUsers.filter(
            //   u => u !== codeName
            // );
            // if (updatedInteractedUsers.length) {
            //   temp.emojisMap.set(emoji, updatedInteractedUsers);
            // } else {
            //   temp.emojisMap.delete(emoji);
            // }
          } else {
            //else add it to the array
            previousInteractedUsers.push(codeName);
            temp.emojisMap.set(emoji, previousInteractedUsers);
          }
        }
        return prevMessages.map(m => {
          if (m.id === destinationMessage.id) {
            return temp;
          } else {
            return m;
          }
        });
      } else {
        blockedEvents.current = [...blockedEvents.current, dbMessage];

        return prevMessages;
      }
    });
  };

  const updateSenderMessageStatus = (message: any) => {
    setMessages(prevMessages => {
      return prevMessages.map(m => {
        if (m.uuid === message.id) {
          return {
            ...m,
            id: message.message_id,
            status: message.status,
            round: message.round
          };
        } else return m;
      });
    });
  };

  const checkIfWillResolveBlockedEvent = (receivedMessage: any) => {
    const blockedEventsToResolve = blockedEvents.current.filter(
      e => e.parent_message_id === receivedMessage.message_id
    );

    if (blockedEventsToResolve?.length) {
      blockedEvents.current = blockedEvents.current.filter(
        e => e.parent_message_id !== blockedEventsToResolve[0].parent_message_id
      );
      blockedEventsToResolve.forEach(e => {
        resolveBlockedEvent(e);
      });
    }
  };

  const resolveBlockedEvent = async (event: any) => {
    if (event.type === 3) {
      handleReactionReceived(event);
    } else if (event.type === 1) {
      const mappedMessages = await mapDbMessagesToMessages([event]);

      if (mappedMessages.length) {
        const currentUserCodename = currentCodeNameRef.current;
        const newMessage = mappedMessages[0];

        setMessages(prev => {
          // Sorting if needed
          if (prev.length === 0) {
            return [newMessage];
          } else {
            const channelMessages = prev.filter(
              m => m.channelId === newMessage.channelId
            );

            // This is the first message for this channel
            if (channelMessages.length === 0) {
              return [...prev, newMessage];
            } else {
              const lastChannelMessageTimestamp = new Date(
                channelMessages[channelMessages.length - 1].timestamp
              ).getTime();
              const newMessageTimestamp = new Date(
                newMessage.timestamp
              ).getTime();

              // No need to sort
              if (newMessageTimestamp >= lastChannelMessageTimestamp) {
                return [...prev, newMessage];
              } else {
                const newMessages = [...prev, newMessage];
                const sortedNewMessages = newMessages.sort((x, y) => {
                  return (
                    new Date(x.timestamp).getTime() -
                    new Date(y.timestamp).getTime()
                  );
                });
                return sortedNewMessages;
              }
            }
          }
        });
      }
    }
  };

  const onReceiveEvent = async (
    uuid: string,
    channelID: Uint8Array,
    isUpdate: boolean
  ) => {
    if (db) {
      const receivedMessage = await db.table("messages").get(uuid);
      if (isUpdate) {
        if ([1, 2, 3].includes(receivedMessage.status)) {
          updateSenderMessageStatus(receivedMessage);
          return;
        }
      }

      if (receivedMessage.type === 3) {
        // It's reaction event
        handleReactionReceived(receivedMessage);
      } else if (receivedMessage.type === 1) {
        const receivedMessageChannelId = receivedMessage?.channel_id;

        if (receivedMessageChannelId !== currentChannelRef?.current?.id) {
          setChannels(prev => {
            return prev.map(ch => {
              if (ch?.id === receivedMessageChannelId) {
                return {
                  ...ch,
                  withMissedMessages: true
                };
              } else {
                return ch;
              }
            });
          });
        }

        // It's normal message or reply to message event
        const mappedMessages = await mapDbMessagesToMessages([receivedMessage]);
        if (mappedMessages.length) {
          const currentUserCodename = currentCodeNameRef.current;
          const newMessage = mappedMessages[0];
          setMessages(prev => {
            // Sorting if needed
            if (prev.length === 0) {
              return [newMessage];
            } else {
              const channelMessages = prev.filter(
                m => m.channelId === newMessage.channelId
              );

              // This is the first message for this channel
              if (channelMessages.length === 0) {
                return [...prev, newMessage];
              } else {
                const lastChannelMessageTimestamp = new Date(
                  channelMessages[channelMessages.length - 1].timestamp
                ).getTime();
                const newMessageTimestamp = new Date(
                  newMessage.timestamp
                ).getTime();

                // No need to sort
                if (newMessageTimestamp >= lastChannelMessageTimestamp) {
                  return [...prev, newMessage];
                } else {
                  const newMessages = [...prev, newMessage];
                  const sortedNewMessages = newMessages.sort((x, y) => {
                    return (
                      new Date(x.timestamp).getTime() -
                      new Date(y.timestamp).getTime()
                    );
                  });
                  return sortedNewMessages;
                }
              }
            }
          });
        }
      }
      checkIfWillResolveBlockedEvent(receivedMessage);
    }
  };

  const mapInitialLoadDataToCurrentState = async (
    channels: any[],
    messages: any[]
  ) => {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const mappedChannels = channels.map((c: Object) => {
          return { ...c }; // Find a way to get the pretty print for the returned channels
        });

        const mappedMessages = await mapDbMessagesToMessages(messages);

        resolve({ mappedChannels, mappedMessages });
      } catch (error) {
        reject(error);
      }
    });
  };

  // A function that takes DB messages, extract all reaction events then apply them to the passed IMessage[]
  // and return the results as IMessage[]
  const bulkUpdateMessagesWithReactions = (
    dbEvents: any[],
    messages: IMessage[]
  ) => {
    const reactionEvents = dbEvents.filter(event => {
      return event.type === 3;
    });

    const messagesCopy = [...messages];

    reactionEvents.forEach(event => {
      const emoji = dec.decode(
        cipherRef?.current?.Decrypt(utils.Base64ToUint8Array(event.text))
      );

      const { codeName } = getCodeNameAndColor(
        event.pubkey,
        event.codeset_version
      );

      // const codeName = event.codename;
      const destinationMessage = messagesCopy.find(
        m => m.id === event.parent_message_id
      );
      let destinationMessageIndex = -1;
      if (destinationMessage) {
        destinationMessageIndex = messagesCopy
          .map(i => i.id)
          .indexOf(destinationMessage.id);
      }

      if (destinationMessage) {
        const temp = destinationMessage;
        // If no emojis map set it.
        if (!temp.emojisMap) {
          temp.emojisMap = new Map();
        }

        // If no key for this reaction set it with this username as the value
        if (!temp.emojisMap.has(emoji)) {
          temp.emojisMap.set(emoji, [codeName]);
        } else {
          const previousInteractedUsers = temp.emojisMap.get(emoji) || [];
          // If emojisMap has this same interaction for this user before then delete it
          if (previousInteractedUsers?.includes(codeName)) {
          } else {
            //else add it to the array
            previousInteractedUsers.push(codeName);
            temp.emojisMap.set(emoji, previousInteractedUsers);
          }
        }

        // Replace the old version in messagesCopy
        if (destinationMessageIndex > -1) {
          messagesCopy[destinationMessageIndex] = temp;
        }
      }
    });
    return messagesCopy;
  };

  // Get all the reaction events related to a group of messages(DB-Events)
  const getDBReactionEvents = async (events: any[]) => {
    // message_id,parent_message_id
    if (db) {
      const eventsIds = events.map(e => e.message_id);
      const reactionEvents = await db
        .table("messages")
        .filter((e: any) => {
          return eventsIds.includes(e.parent_message_id) && e.type === 3;
        })
        .toArray();
      return reactionEvents;
    } else {
      return [];
    }
  };

  const handleInitialLoadData = (storageTag: string) => {
    return new Promise(async (resolve, reject) => {
      try {
        db = new Dexie(`${storageTag}_speakeasy`);
        db.version(0.1).stores({
          channels: "++id",
          messages:
            "++id,channel_id,&message_id,parent_message_id,pinned,timestamp"
        });

        const channels = await db.table("channels").toArray();
        const channelsIds = channels.map(ch => ch.id);

        const groupedMessages = await Promise.all(
          channelsIds.map(async chId => {
            return db!
              .table("messages")
              .orderBy("timestamp")
              .reverse()
              .filter(m => {
                return m.channel_id === chId && m.type === 1;
              })
              .limit(batchCount)
              .toArray();
          })
        );
        let messages: any[] = [];

        groupedMessages.forEach(g => {
          messages = [...messages, ..._.reverse(g)];
        });

        const result = await mapInitialLoadDataToCurrentState(
          channels,
          messages
        );
        const mappedMessages = result.mappedMessages;
        const mappedChannels = result.mappedChannels;

        const reactionEvents = await getDBReactionEvents(messages);

        const messagesWithReactions = bulkUpdateMessagesWithReactions(
          reactionEvents,
          mappedMessages
        );

        setChannels(
          mappedChannels.map((ch: IChannel) => {
            return {
              ...ch,
              currentMessagesBatch: 1
            };
          })
        );
        setMessages(messagesWithReactions);

        resolve({ channels, messages });
      } catch (error) {
        reject(error);
      }
    });
  };

  const loadChannelManager = async (storageTag: string, net?: any) => {
    const currentNetwork = network || net;

    if (
      currentNetwork &&
      cipherRef?.current &&
      utils &&
      utils.LoadChannelsManagerWithIndexedDb
    ) {
      utils
        .LoadChannelsManagerWithIndexedDb(
          currentNetwork.GetID(),
          storageTag,
          onReceiveEvent,
          cipherRef?.current?.GetID()
        )
        .then(async (res: IChannelManager) => {
          setChanManager(res);
          handleInitialLoadData(storageTag);
        });
    }
  };

  const createChannelManager = async (privateIdentity: any, net?: any) => {
    console.log("Test 0000 createChannelManager called");
    return new Promise((resolve, reject) => {
      const currentNetwork = network || net;
      if (
        currentNetwork &&
        cipherRef?.current &&
        utils &&
        utils.NewChannelsManagerWithIndexedDb
      ) {
        utils
          .NewChannelsManagerWithIndexedDb(
            currentNetwork.GetID(),
            privateIdentity,
            onReceiveEvent,
            cipherRef?.current?.GetID()
          )
          .then(async (res: IChannelManager) => {
            console.log("Test 0000 ChannelManager is created");
            setChanManager(res);
            const storageTag = res.GetStorageTag();
            addStorageTag(storageTag);
            resolve(true);
            handleInitialLoadData(storageTag);
          });
      }
    });
  };

  // Used on registeration
  const initiateCmix = (password: string, cb?: Function) => {
    try {
      const statePassEncoded = utils.GetOrInitPassword(password);

      // Check if state exists
      if (!isStatePathExisted()) {
        utils.NewCmix(ndf, STATE_PATH, statePassEncoded, "");
        setStatePath();
      }
      loadCmix(statePassEncoded, cb);
    } catch (error) {
      console.error("Failed to load Cmix: " + error);
      return;
    }
  };

  // Used directly on Login
  const loadCmix = (statePassEncoded: string, cb?: Function) => {
    return new Promise(async (resolve, reject) => {
      let net;
      try {
        net = await utils.LoadCmix(
          STATE_PATH,
          statePassEncoded,
          utils.GetDefaultCMixParams()
        );
        try {
          dummyTrafficObjRef.current = utils.NewDummyTrafficManager(
            net.GetID(),
            3,
            15000,
            7000
          );
        } catch (error) {
          console.log("error while creating the Dummy Traffic Object:", error);
        }

        const cipherObj = utils.NewChannelsDatabaseCipher(
          net.GetID(),
          statePassEncoded,
          725
        );
        cipherRef.current = cipherObj;
        if (net?.AddHealthCallback) {
          net.AddHealthCallback({
            Callback: (isHealthy: boolean) => {
              if (isHealthy) {
                setIsNetworkHealthy(true);
                if (
                  dummyTrafficObjRef &&
                  dummyTrafficObjRef.current &&
                  !dummyTrafficObjRef?.current?.GetStatus()
                ) {
                  dummyTrafficObjRef?.current?.SetStatus(true);
                }
              } else {
                setIsNetworkHealthy(false);
              }
            }
          });
        }
        setNetwork(net);

        if (cb) {
          cb(net);
        }
        resolve(true);
      } catch (e) {
        console.error("Failed to load Cmix: " + e);
        reject(e);
        // return;
      }
    });
  };

  useEffect(() => {
    if (!currentChannel && channels.length) {
      setCurrentChannel(channels[0]);
    }
  }, [currentChannel]);

  const connectNetwork = async () => {
    if (network) {
      setNetworkStatus(NetworkStatus.CONNECTING);
      network.StartNetworkFollower(50000);
      await network.WaitForNetwork(10 * 60 * 1000).then(
        () => {
          setNetworkStatus(NetworkStatus.CONNECTED);
        },
        () => {
          console.error("Timed out. Network is not healthy.");
          setNetworkStatus(NetworkStatus.FAILED);
          // throw new Error("Timed out. Network is not healthy.");
        }
      );
    }
  };

  const loadMoreChannelData = async (chId: string) => {
    return new Promise(async (resolve, reject) => {
      if (db) {
        const currentChannel = channels.find(ch => ch.id === chId);
        const currentChannelBatch = currentChannel?.currentMessagesBatch || 1;
        const newMessages = await db
          .table("messages")
          .orderBy("timestamp")
          .reverse()
          .filter(m => {
            return m.channel_id === chId && m.type === 1;
          })
          .offset(currentChannelBatch * batchCount)
          .limit(batchCount)
          .toArray();

        const result = await mapInitialLoadDataToCurrentState([], newMessages);
        // Here we should apply the reactions then change the state
        const mappedMessages = result.mappedMessages;

        const reactionEvents = await getDBReactionEvents(newMessages);

        const messagesWithReactions = bulkUpdateMessagesWithReactions(
          reactionEvents,
          mappedMessages
        );

        if (messagesWithReactions.length) {
          setMessages(prev => {
            return [..._.reverse(messagesWithReactions), ...prev];
          });

          setChannels((prevChannels: IChannel[]) => {
            return prevChannels.map(ch => {
              if (ch.id === chId) {
                return {
                  ...ch,
                  currentMessagesBatch: currentChannelBatch + 1
                };
              } else {
                return ch;
              }
            });
          });
          resolve(true);
        }
      }
    });
  };

  const joinChannel = (
    prettyPrint: string,
    appendToCurrent: boolean = true
  ) => {
    return new Promise((resolve, reject) => {
      if (prettyPrint && chanManager && chanManager.JoinChannel) {
        try {
          const chanInfo = JSON.parse(
            dec.decode(chanManager.JoinChannel(prettyPrint))
          );

          if (appendToCurrent) {
            let temp = {
              id: chanInfo?.ChannelID,
              name: chanInfo?.Name,
              description: chanInfo?.Description,
              isLoading: true
            };
            setCurrentChannel(temp);
            setChannels(prev => [...prev, temp]);
            setTimeout(() => {
              setCurrentChannel((prev: any) => {
                if (prev?.id === temp.id) {
                  return {
                    ...prev,
                    isLoading: false
                  };
                } else {
                  return prev;
                }
              });
              setChannels(prev => {
                return prev.map(ch => {
                  if (ch.id === temp.id) {
                    return {
                      ...temp,
                      isLoading: false
                    };
                  } else {
                    return ch;
                  }
                });
              });
            }, 5000);
          }

          resolve(true);
        } catch (error) {
          reject(error);
        }
      }
    });
  };
  const joinChannelFromURL = (url: string, password: string = "") => {
    if (network && chanManager && chanManager.JoinChannelFromURL) {
      try {
        const chanInfo = JSON.parse(
          dec.decode(chanManager.JoinChannelFromURL(url, password))
        );
        let temp = {
          id: chanInfo?.ChannelID,
          name: chanInfo?.Name,
          description: chanInfo?.Description,
          isLoading: true
        };
        setCurrentChannel(temp);
        setChannels([...channels, temp]);
        setTimeout(() => {
          setCurrentChannel((prev: any) => {
            if (prev?.id === temp.id) {
              return {
                ...prev,
                isLoading: false
              };
            } else {
              return prev;
            }
          });
          setChannels(prev => {
            return prev.map(ch => {
              if (ch.id === temp.id) {
                return {
                  ...temp,
                  isLoading: false
                };
              } else {
                return ch;
              }
            });
          });
        }, 5000);
        return true;
      } catch (error) {
        return null;
      }
    } else {
      return null;
    }
  };

  const createChannel = (
    channelName: string,
    channelDescription: string,
    privacyLevel: 0 | 2
  ) => {
    return new Promise(async (resolve, reject) => {
      if (channelName && utils?.GenerateChannel) {
        try {
          const channelUnparsed = utils?.GenerateChannel(
            network?.GetID(),
            channelName,
            channelDescription || "",
            privacyLevel
          );
          const channel = JSON.parse(dec.decode(channelUnparsed));
          const channelInfo = getChannelInfo(channel?.Channel || "");
          joinChannel(channel?.Channel, false);
          let temp = {
            id: channelInfo?.ChannelID,
            name: channelInfo?.Name,
            description: channelInfo?.Description,
            prettyPrint: channel?.Channel,
            isLoading: false
          };
          savePrettyPrint(temp.id, temp.prettyPrint);
          setCurrentChannel(temp);
          setChannels([...channels, temp]);
          resolve(true);
        } catch (error) {
          reject(error);
        }
      }
    });
  };
  const shareChannel = () => {};

  const savePrettyPrint = (channelId: string, pp: string) => {
    const prev = JSON.parse(localStorage.getItem("prettyprints") || `{}`);

    prev[channelId] = pp;

    localStorage.setItem("prettyprints", JSON.stringify(prev));
  };

  const getPrettyPrint = (channelId: string) => {
    const prev = JSON.parse(localStorage.getItem("prettyprints") || `{}`);
    return prev[channelId];
  };

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
        const channelId = temp.id;
        setMessages(prev => {
          return prev.filter(m => m.channelId !== channelId);
        });
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
        new Uint8Array()
      );
    }
  };

  const sendReply = async (reply: string, replyToMessageId: string) => {
    if (
      reply.length &&
      chanManager &&
      utils &&
      utils.Base64ToUint8Array &&
      currentChannel
    ) {
      try {
        await chanManager.SendReply(
          utils.Base64ToUint8Array(currentChannel.id),
          reply,
          utils.Base64ToUint8Array(replyToMessageId),
          30000,
          new Uint8Array()
        );
      } catch (error) {
        console.error(`Test failed to reply to messageId ${replyToMessageId}`);
      }
    }
  };

  const sendReaction = async (reaction: string, reactToMessageId: string) => {
    if (chanManager && utils && utils.Base64ToUint8Array && currentChannel) {
      try {
        await chanManager.SendReaction(
          utils.Base64ToUint8Array(currentChannel.id),
          reaction,
          utils.Base64ToUint8Array(reactToMessageId),
          new Uint8Array()
        );
      } catch (error) {
        console.error(
          `Test failed to react to messageId ${reactToMessageId}`,
          error
        );
      }
    }
  };

  const setNickName = (nickName: string) => {
    if (chanManager?.SetNickname) {
      try {
        chanManager?.SetNickname(
          nickName,
          utils.Base64ToUint8Array(currentChannel?.id)
        );
        return true;
      } catch (error) {
        return false;
      }
    }
  };

  const getNickName = () => {
    let nickName = "";
    if (chanManager?.GetNickname && currentChannel) {
      try {
        nickName = chanManager?.GetNickname(
          utils.Base64ToUint8Array(currentChannel?.id)
        );
      } catch (error) {
        nickName = "";
      }
    }
    return nickName;
  };

  const getIdentity = () => {
    try {
      return JSON.parse(dec.decode(chanManager?.GetIdentity())) || {};
    } catch (error) {
      console.error(error);
      return {};
    }
  };

  const getShareURL = () => {
    if (
      network &&
      chanManager &&
      chanManager.GetShareURL &&
      utils &&
      utils.Base64ToUint8Array &&
      currentChannel
    ) {
      try {
        const currentHostName = window.location.host;
        const res = chanManager.GetShareURL(
          network?.GetID(),
          `http://${currentHostName}/join`,
          0,
          utils.Base64ToUint8Array(currentChannel.id)
        );
        return JSON.parse(dec.decode(res));
      } catch (error) {
        return null;
      }
    } else {
      return null;
    }
  };

  const getShareUrlType = (url: string) => {
    if (url && utils && utils.GetShareUrlType) {
      try {
        const res = utils.GetShareUrlType(url);
        return res;
      } catch (error) {
        return null;
      }
    } else {
      return null;
    }
  };

  // Identity object is combination of private identity and code name
  const generateIdentitiesObjects = (n: number) => {
    const identitiesObjects = [];
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

  const getVersion = () => {
    if (utils && utils.GetVersion) {
      return utils.GetVersion();
    } else return null;
  };

  const getClientVersion = () => {
    if (utils && utils.GetClientVersion) {
      return utils.GetClientVersion();
    } else return null;
  };

  const exportDataToFile = (data: any) => {
    const filename = "speakeasyIdentity.json";

    const file = new Blob([data], { type: "text/plain" });
    let a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  };

  const exportPrivateIdentity = (password: string) => {
    if (utils && utils.GetOrInitPassword) {
      try {
        const statePassEncoded = utils.GetOrInitPassword(password);

        if (
          statePassEncoded &&
          chanManager &&
          chanManager.ExportPrivateIdentity
        ) {
          const data = chanManager.ExportPrivateIdentity(password);
          exportDataToFile(data);
          return statePassEncoded;
        }
      } catch (error) {
        return false;
      }
    }
  };

  const getCodeNameAndColor = (publicKey: string, codeset: number) => {
    if (utils && utils.ConstructIdentity && utils.Base64ToUint8Array) {
      try {
        const identity = JSON.parse(
          dec.decode(
            utils.ConstructIdentity(
              utils.Base64ToUint8Array(publicKey),
              codeset
            )
          )
        );
        return {
          codeName: identity.Codename,
          color: identity.Color
        };
      } catch (error) {
        console.error("Failed to get codename and color", error);
        return {};
      }
    } else {
      return {};
    }
  };

  const checkIsRedayToRegister = (
    selectedPrivateIdentity: string,
    onIsReadyInfoChange: Function
  ) => {
    console.log("Test 0000 checkIsReday called:");
    return new Promise((resolve, reject) => {
      const intervalId = setInterval(() => {
        const isReadyInfo = JSON.parse(dec.decode(network?.IsReady(0.7)));
        onIsReadyInfoChange(isReadyInfo);
        console.log("Test 0000 isReadyInfo:", isReadyInfo);
        if (isReadyInfo.IsReady) {
          clearInterval(intervalId);
          setTimeout(() => {
            createChannelManager(selectedPrivateIdentity);
            setIsReadyToRegister(true);
            resolve(true);
          }, 3000);
        }
      }, 1000);
    });
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
        messages,
        setMessages,
        currentChannel,
        setCurrentChannel,
        sendMessage,
        leaveChannel,
        generateIdentitiesObjects,
        connectNetwork,
        initiateCmix,
        loadCmix,
        createChannelManager,
        loadChannelManager,
        handleInitialLoadData,
        setNickName,
        getNickName,
        getIdentity,
        sendReply,
        sendReaction,
        getPrettyPrint,
        getShareURL,
        getShareUrlType,
        joinChannelFromURL,
        getVersion,
        getClientVersion,
        loadMoreChannelData,
        exportPrivateIdentity,
        getCodeNameAndColor,
        isNetworkHealthy,
        isReadyToRegister,
        setIsReadyToRegister,
        checkIsRedayToRegister
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
