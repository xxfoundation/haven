import React, { FC, useState, useEffect, useRef, useCallback, useMemo } from 'react';

import { Dexie } from 'dexie';
import _ from 'lodash';
import Cookies from 'js-cookie';

import { CMix, IsReadyInfo } from 'src/types/cmix';
import { IMessage } from 'src/types';
import { decoder } from 'src/utils';
import { useAuthentication } from 'src/contexts/authentication-context';
import { useUtils } from 'src/contexts/utils-context';
import { ndf } from 'src/sdk-utils/ndf';
import { STATE_PATH } from '../constants';

const batchCount = 100;

export enum NetworkStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  FAILED = 'failed'
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

const exportDataToFile = (data: any) => {
  const filename = 'speakeasyIdentity.json';

  const file = new Blob([data], { type: 'text/plain' });
  const a = document.createElement('a');
  const url = URL.createObjectURL(file);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
};

export const NetworkClientContext = React.createContext<{
  network?: CMix;
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
  logout: Function;
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
  checkIsRedayToRegister: () => {},
  logout: () => {}
});

NetworkClientContext.displayName = 'NetworkClientContext';

export const NetworkProvider: FC<any> = props => {
  const {
    addStorageTag,
    statePathExists: isStatePathExisted,
    setIsAuthenticated,
    setStatePath
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
  const blockedEvents = useRef<any[]>([]);
  const currentCodeNameRef = useRef<string>('');
  const currentChannelRef = useRef<IChannel>();
  const bc = useMemo(() => new BroadcastChannel('join_channel'), []);

  const dummyTrafficObjRef = useRef<any>(undefined);

  const cipherRef = useRef<IDatabaseCipher>();

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

  const getIdentity = useCallback(() => {
    try {
      return JSON.parse(decoder.decode(chanManager?.GetIdentity())) || {};
    } catch (error) {
      console.error(error);
      return {};
    }
  }, [chanManager]);

  const connectNetwork = useCallback(async () => {
    if (network) {
      setNetworkStatus(NetworkStatus.CONNECTING);
      try {
        network.StartNetworkFollower(50000);
      } catch (error) {
        console.error('Error while StartNetworkFollower:', error);
      }
      await network.WaitForNetwork(10 * 60 * 1000).then(
        () => {
          setNetworkStatus(NetworkStatus.CONNECTED);
        },
        () => {
          console.error('Timed out. Network is not healthy.');
          setNetworkStatus(NetworkStatus.FAILED);
        }
      );
    }
  }, [network]);
  
  const joinChannel = useCallback((
    prettyPrint: string,
    appendToCurrent = true
  ) => {
    return new Promise((resolve, reject) => {
      if (prettyPrint && chanManager && chanManager.JoinChannel) {
        try {
          const chanInfo = JSON.parse(
            decoder.decode(chanManager.JoinChannel(prettyPrint))
          );

          if (appendToCurrent) {
            const temp = {
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
  }, [chanManager]);

  const getCodeNameAndColor = useCallback((publicKey: string, codeset: number) => {
    if (utils && utils.ConstructIdentity && utils.Base64ToUint8Array) {
      try {
        const identity = JSON.parse(
          decoder.decode(
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
        console.error('Failed to get codename and color', error);
        return {};
      }
    } else {
      return {};
    }
  }, [utils]);

  useEffect(() => {
    if (chanManager) {
      currentCodeNameRef.current = getIdentity().Codename;
      Cookies.set('userAuthenticated', 'true', { path: '/' });
    }
  }, [chanManager, getIdentity]);

  useEffect(() => {
    bc.onmessage = async event => {
      if (event.data?.prettyPrint) {
        try {
          await joinChannel(event.data.prettyPrint);
        } catch (error) {}
      }
    };
  }, [bc, chanManager, joinChannel]);

  useEffect(() => {
    if (network) {
      setIsAuthenticated(true);
    }

    if (network && networkStatus !== NetworkStatus.CONNECTED) {
      connectNetwork();
    }
  }, [connectNetwork, network, networkStatus, setIsAuthenticated]);

  const mapDbMessagesToMessages = useCallback(async (msgs: any[]) => {
    if (!db || !(cipherRef && cipherRef.current)) {
      return [];
    } else {
      const messagesParentIds = msgs
        .filter(e => e.parent_message_id)
        .map(e => e.parent_message_id);

      const relatedMessages =
        (await db
          .table('messages')
          .where('message_id')
          .anyOf(messagesParentIds)
          .toArray()) || [];

      const mappedMessages: IMessage[] = [];

      msgs.forEach((m: any) => {
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
            body: decoder.decode(
              cipherRef?.current?.Decrypt(utils.Base64ToUint8Array(m.text))
            ),
            timestamp: m.timestamp,
            codeName: messageCodeName,
            nickName: m.nickname || '',
            color: messageColor,
            channelId: m.channel_id,
            status: m.status,
            uuid: m.id,
            round: m.round,
            replyToMessage: {
              id: replyToMessage.message_id,
              body: decoder.decode(
                cipherRef?.current?.Decrypt(
                  utils.Base64ToUint8Array(replyToMessage.text)
                )
              ),
              timestamp: replyToMessage.timestamp,
              codeName: replyToMessageCodeName,
              nickName: replyToMessage.nickname || '',
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
            body: decoder.decode(
              cipherRef?.current?.Decrypt(utils.Base64ToUint8Array(m.text))
            ),
            timestamp: m.timestamp,
            codeName: messageCodeName,
            nickName: m.nickname || '',
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
  }, [getCodeNameAndColor, utils]);

  const handleReactionReceived = useCallback((dbMessage: any) => {
    setMessages(prevMessages => {
      const destinationMessage = prevMessages.find(
        m => m.id === dbMessage.parent_message_id
      );
      if (destinationMessage) {
        const temp = destinationMessage;
        // const emoji = dbMessage.text;
        const emoji = decoder.decode(
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
  }, [getCodeNameAndColor, utils]);

  const updateSenderMessageStatus = useCallback((message: any) => {
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
  }, []);

  const resolveBlockedEvent = useCallback(async (event: any) => {
    if (event.type === 3) {
      handleReactionReceived(event);
    } else if (event.type === 1) {
      const mappedMessages = await mapDbMessagesToMessages([event]);

      if (mappedMessages.length) {
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
  }, [handleReactionReceived, mapDbMessagesToMessages]);

  const checkIfWillResolveBlockedEvent = useCallback((receivedMessage: any) => {
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
  }, [resolveBlockedEvent]);

  const onReceiveEvent = useCallback(async (
    uuid: string,
    channelID: Uint8Array,
    isUpdate: boolean
  ) => {
    if (db) {
      const receivedMessage = await db.table('messages').get(uuid);
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
  }, [
    checkIfWillResolveBlockedEvent,
    handleReactionReceived,
    mapDbMessagesToMessages,
    updateSenderMessageStatus
  ]);

  const mapInitialLoadDataToCurrentState = useCallback(async (
    channs: any[],
    msgs: any[]
  ) => {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const mappedChannels = channs.map((c: Record<string, unknown>) => {
          return { ...c }; // Find a way to get the pretty print for the returned channels
        });

        const mappedMessages = await mapDbMessagesToMessages(msgs);

        resolve({ mappedChannels, mappedMessages });
      } catch (error) {
        reject(error);
      }
    });
  }, [mapDbMessagesToMessages]);

  // A function that takes DB messages, extract all reaction events then apply them to the passed IMessage[]
  // and return the results as IMessage[]
  const bulkUpdateMessagesWithReactions = useCallback((
    dbEvents: any[],
    msgs: IMessage[]
  ) => {
    const reactionEvents = dbEvents.filter(event => {
      return event.type === 3;
    });

    const messagesCopy = [...msgs];

    reactionEvents.forEach(event => {
      const emoji = decoder.decode(
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
  }, [getCodeNameAndColor, utils]);

  // Get all the reaction events related to a group of messages(DB-Events)
  const getDBReactionEvents = useCallback(async (events: any[]) => {
    // message_id,parent_message_id
    if (db) {
      const eventsIds = events.map(e => e.message_id);
      const reactionEvents = await db
        .table('messages')
        .filter((e: any) => {
          return eventsIds.includes(e.parent_message_id) && e.type === 3;
        })
        .toArray();
      return reactionEvents;
    } else {
      return [];
    }
  }, []);

  const handleInitialLoadData = useCallback((storageTag: string) => {
    return new Promise(async (resolve, reject) => {
      try {
        db = new Dexie(`${storageTag}_speakeasy`);
        db.version(0.1).stores({
          channels: '++id',
          messages:
            '++id,channel_id,&message_id,parent_message_id,pinned,timestamp'
        });

        const channs = await db.table('channels').toArray();
        const channelsIds = channs.map(ch => ch.id);

        const groupedMessages = await Promise.all(
          channelsIds.map(async chId => {
            if (!db) {
              throw new Error('Dexie initialization error');
            }

            // TODO this is not optimized
            return db.table('messages')
              .orderBy('timestamp')
              .reverse()
              .filter(m => {
                return m.channel_id === chId && m.type === 1;
              })
              .limit(batchCount)
              .toArray();
          })
        );
        let msgs: any[] = [];

        groupedMessages.forEach(g => {
          msgs = [...msgs, ..._.reverse(g)];
        });

        const result = await mapInitialLoadDataToCurrentState(
          channs,
          msgs
        );
        const mappedMessages = result.mappedMessages;
        const mappedChannels = result.mappedChannels;

        const reactionEvents = await getDBReactionEvents(msgs);

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

        resolve({ channels: channs, messages: msgs });
      } catch (error) {
        reject(error);
      }
    });
  }, [
    bulkUpdateMessagesWithReactions,
    getDBReactionEvents,
    mapInitialLoadDataToCurrentState
  ]);

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

  const createChannelManager = useCallback(async (privateIdentity: any, net?: any) => {
    return new Promise((resolve) => {
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
            setChanManager(res);
            const storageTag = res.GetStorageTag();
            addStorageTag(storageTag);
            resolve(true);
            handleInitialLoadData(storageTag);
          });
      }
    });
  }, [
    addStorageTag,
    handleInitialLoadData,
    network,
    onReceiveEvent,
    utils
  ]);

  // Used directly on Login
  const loadCmix = useCallback((statePassEncoded: string, cb?: (network: any) => void) => {
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
          console.error('error while creating the Dummy Traffic Object:', error);
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
        console.error('Failed to load Cmix: ' + e);
        reject(e);
        // return;
      }
    });
  }, [utils]);

  // Used on registeration
  const initiateCmix = useCallback((password: string, cb?: (network: any) => void) => {
    try {
      const statePassEncoded = utils.GetOrInitPassword(password);
      // Check if state exists
      if (!isStatePathExisted()) {
        utils.NewCmix(ndf, STATE_PATH, statePassEncoded, '');
        setStatePath();
      }

      loadCmix(statePassEncoded, cb);
    } catch (error) {
      console.error('Failed to load Cmix: ' + error);
      return;
    }
  }, [isStatePathExisted, loadCmix, setStatePath, utils]);

  useEffect(() => {
    if (!currentChannel && channels.length) {
      setCurrentChannel(channels[0]);
    }
  }, [channels, currentChannel]);

  const loadMoreChannelData = useCallback(async (chId: string) => {
    return new Promise(async (resolve) => {
      if (db) {
        const foundChannel = channels.find(ch => ch.id === chId);
        const currentChannelBatch = foundChannel?.currentMessagesBatch || 1;
        const newMessages = await db
          .table('messages')
          .orderBy('timestamp')
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
  }, [
    bulkUpdateMessagesWithReactions,
    channels,
    getDBReactionEvents,
    mapInitialLoadDataToCurrentState
  ]);

  const joinChannelFromURL = useCallback((url: string, password = '') => {
    if (network && chanManager && chanManager.JoinChannelFromURL) {
      try {
        const chanInfo = JSON.parse(
          decoder.decode(chanManager.JoinChannelFromURL(url, password))
        );
        const temp = {
          id: chanInfo?.ChannelID,
          name: chanInfo?.Name,
          description: chanInfo?.Description,
          isLoading: true
        };
        setCurrentChannel(temp);
        setChannels([...channels, temp]);
        setTimeout(() => {
          setCurrentChannel((prev) => {
            if (prev && prev?.id === temp.id) {
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
  }, [chanManager, channels, network]);

  const savePrettyPrint = (channelId: string, pp: string) => {
    const prev = JSON.parse(localStorage.getItem('prettyprints') || '{}');

    prev[channelId] = pp;

    localStorage.setItem('prettyprints', JSON.stringify(prev));
  };

  const getChannelInfo = useCallback((prettyPrint: string) => {
    if (utils && utils.GetChannelInfo && prettyPrint.length) {
      return JSON.parse(decoder.decode(utils.GetChannelInfo(prettyPrint)));
    }
    return {};
  }, [utils]);


  const createChannel = useCallback((
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
            channelDescription || '',
            privacyLevel
          );
          const channel = JSON.parse(decoder.decode(channelUnparsed));
          const channelInfo = getChannelInfo(channel?.Channel || '');
          joinChannel(channel?.Channel, false);
          const temp = {
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
  }, [channels, getChannelInfo, joinChannel, network, utils]);

  const shareChannel = () => {};

  const getPrettyPrint = useCallback((channelId: string) => {
    const prev = JSON.parse(localStorage.getItem('prettyprints') || '{}');
    return prev[channelId];
  }, []);

  const leaveChannel = useCallback(async () => {
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
        console.error('Failed to leave Channel.');
      }
    }
  }, [chanManager, channels, currentChannel, utils]);

  const sendMessage = useCallback(async (message: string) => {
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
  }, [chanManager, currentChannel, utils]);

  const sendReply = useCallback(async (reply: string, replyToMessageId: string) => {
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
  }, [chanManager, currentChannel, utils]);

  const sendReaction = useCallback(async (reaction: string, reactToMessageId: string) => {
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
  }, [chanManager, currentChannel, utils]);

  const setNickName = useCallback((nickName: string) => {
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
  }, [chanManager, currentChannel?.id, utils]);

  const getNickName = useCallback(() => {
    let nickName = '';
    if (chanManager?.GetNickname && currentChannel) {
      try {
        nickName = chanManager?.GetNickname(
          utils.Base64ToUint8Array(currentChannel?.id)
        );
      } catch (error) {
        nickName = '';
      }
    }
    return nickName;
  }, [chanManager, currentChannel, utils]);

  const getShareURL = useCallback(() => {
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
        return JSON.parse(decoder.decode(res));
      } catch (error) {
        return null;
      }
    } else {
      return null;
    }
  }, [chanManager, currentChannel, network, utils]);

  const getShareUrlType = useCallback((url: string) => {
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
  }, [utils]);

  // Identity object is combination of private identity and code name
  const generateIdentitiesObjects = useCallback((n: number) => {
    const identitiesObjects = [];
    if (utils && utils.GenerateChannelIdentity && network) {
      for (let i = 0; i < n; i++) {
        const privateIdentity = utils.GenerateChannelIdentity(network?.GetID());
        const publicIdentity = utils.GetPublicChannelIdentityFromPrivate(
          privateIdentity
        );
        const identity = JSON.parse(decoder.decode(publicIdentity));
        const codeName = identity.Codename;
        identitiesObjects.push({ privateIdentity, codeName });
      }
    }
    return identitiesObjects;
  }, [network, utils])

  const getVersion = useCallback(() => {
    if (utils && utils.GetVersion) {
      return utils.GetVersion();
    } else return null;
  }, [utils]);

  const getClientVersion = useCallback(() => {
    if (utils && utils.GetClientVersion) {
      return utils.GetClientVersion();
    } else return null;
  }, [utils]);

  const exportPrivateIdentity = useCallback((password: string) => {
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
  }, [chanManager, utils]);

  const checkIsRedayToRegister = useCallback((
    selectedPrivateIdentity: string,
    onIsReadyInfoChange: (readinessInfo: IsReadyInfo) => void
  ) => {
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        const isReadyInfo = JSON.parse(decoder.decode(network?.IsReady(0.7)));

        onIsReadyInfoChange(isReadyInfo);
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
  }, [createChannelManager, network]);

  const logout = useCallback((password: string) => {
    if (utils && utils.Purge && network && network.StopNetworkFollower) {
      try {
        network.StopNetworkFollower();
        utils.Purge(STATE_PATH, password);
        window.localStorage.clear();
        Cookies.remove('userAuthenticated', { path: '/' });
        setIsAuthenticated(false);
        setNetworkStatus(NetworkStatus.DISCONNECTED);
        setNetwork(undefined);
        setIsReadyToRegister(undefined);
        setIsNetworkHealthy(undefined);
        setChannels([]);
        setCurrentChannel(undefined);
        setChanManager(undefined);
        setMessages([]);
        blockedEvents.current = [];
        currentCodeNameRef.current = '';
        currentChannelRef.current = undefined;
        dummyTrafficObjRef.current = undefined;
        cipherRef.current = undefined;

        return true;
      } catch (error) {
        console.error(error);
        // If something wrong happened like wrong password then we should start network follower again
        network.StartNetworkFollower(50000);
        return false;
      }
    } else {
      return false;
    }
  }, [network, setIsAuthenticated, utils]);

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
        checkIsRedayToRegister,
        logout
      }}
      {...props}
    />
  );
};

export const useNetworkClient = () => {
  const context = React.useContext(NetworkClientContext);
  if (context === undefined) {
    throw new Error('useNetworkClient must be used within a NetworkProvider');
  }
  return context;
};

export const ManagedNetworkContext: FC<any> = ({ children }) => (
  <NetworkProvider>{children}</NetworkProvider>
);
