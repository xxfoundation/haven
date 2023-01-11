import { ChannelJSON, DummyTraffic, MessageReceivedCallback } from 'src/contexts/utils-context';
import React, { FC, useState, useEffect, useRef, useCallback, useMemo } from 'react';

import { Dexie } from 'dexie';
import _ from 'lodash';
import Cookies from 'js-cookie';
import assert from 'assert';

import { Message, WithChildren } from 'src/types';
import { decoder, encoder, exportDataToFile } from 'src/utils';
import { useAuthentication } from 'src/contexts/authentication-context';
import { PrivacyLevel, useUtils } from 'src/contexts/utils-context';
import { ndf } from 'src/sdk-utils/ndf';
import { PIN_MESSAGE_LENGTH_MILLISECONDS, STATE_PATH } from '../constants';
import useNotification from 'src/hooks/useNotification';
import usePrevious from 'src/hooks/usePrevious';

const batchCount = 100;

enum DBMessageType {
  Normal = 1,
  Reply = 2,
  Reaction = 3
}

enum DBMessageStatus {
  Sending = 1,
  Sent = 2,
  Delivered = 3
}

export type DBMessage = {
  id: number;
  nickname: string;
  message_id: string;
  channel_id: string;
  parent_message_id: null | string;
  timestamp: string;
  lease: number;
  status: DBMessageStatus;
  hidden: boolean,
  pinned: boolean;
  text: string;
  type: DBMessageType;
  round: number;
  pubkey: string;
  codeset_version: number;
}

export type DBChannel = {
  id: string;
  name: string;
  description: string;
}

export type User = {
  codename: string;
  color: string;
  pubkey: string;
}

export enum NetworkStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  FAILED = 'failed'
}

export enum MessageType {
  Text = 1,
  AdminText = 2,
  Reaction = 3
}

export type IsReadyInfo = {
  IsReady: boolean;
  HowClose: number;
}

type ShareURL = {
  url: string;
  password: string;
}

type HealthCallback = { Callback: (healthy: boolean) => void }

export type CMix = {
  AddHealthCallback: (callback: HealthCallback) => number;
  GetID: () => number;
  IsReady: (threshold: number) => Uint8Array;
  ReadyToSend: () => boolean,
  StartNetworkFollower: (timeoutMilliseconds: number) => void;
  StopNetworkFollower: () => void;
  WaitForNetwork: (timeoutMilliseconds: number) => Promise<void>;
}

export type DatabaseCipher = {
  GetID: () => number;
  Decrypt: (plaintext: Uint8Array) => Uint8Array;
}

export type ChannelManager = {
  GetChannels: () => Uint8Array;
  GetID: () => number;
  JoinChannel: (channelId: string) => Uint8Array;
  LeaveChannel: (channelId: Uint8Array) => void;
  GetMutedUsers: (channelId: Uint8Array) => Uint8Array;
  Muted: (channelId: Uint8Array) => boolean;
  MuteUser: (
    channelId: Uint8Array,
    publicKey: Uint8Array,
    mute: boolean,
    messageValidityTimeoutMilliseconds: number,
    cmixParams?: Uint8Array
  ) => Promise<void>;
  SendMessage: (
    channelId: Uint8Array,
    message: string,
    messageValidityTimeoutMilliseconds: number,
    cmixParams: Uint8Array
  ) => Promise<Uint8Array>;
  PinMessage: (
    channelId: Uint8Array,
    messageId: Uint8Array,
    unpin: boolean,
    pinDurationInMilliseconds: number,
    cmixParams: Uint8Array,
  ) => Promise<Uint8Array>;
  DeleteMessage: (
    channelId: Uint8Array,
    messageId: Uint8Array,
    undelete: boolean,
    cmixParams: Uint8Array
  ) => Promise<void>;
  SendReaction: (
    channelId: Uint8Array,
    reaction: string,
    messageToReactTo: Uint8Array,
    cmixParams: Uint8Array
  ) => Promise<Uint8Array>;
  SendReply: (
    channelId: Uint8Array,
    message: string,
    messageToReactTo: Uint8Array,
    messageValidityTimeoutMilliseconds: number,
    cmixParams: Uint8Array
  ) => Promise<Uint8Array>;
  IsChannelAdmin: (channelId: Uint8Array) => boolean;
  GenerateChannel: (channelname: string, description: string, privacyLevel: PrivacyLevel) => Promise<string>;
  GetStorageTag: () => string;
  SetNickname: (newNickname: string, channel: Uint8Array) => void;
  GetNickname: (channelId: Uint8Array) => string;
  GetIdentity: () => Uint8Array;
  GetShareURL: (cmixId: number, host: string, maxUses: number, channelId: Uint8Array) => Uint8Array;
  JoinChannelFromURL: (url: string, password: string) => Uint8Array;
  ExportPrivateIdentity: (password: string) => Uint8Array;
  ExportChannelAdminKey: (channelId: Uint8Array, encryptionPassword: string) => Uint8Array;
  ImportChannelAdminKey: (channelId: Uint8Array, encryptionPassword: string, privateKey: Uint8Array) => void;
}

export interface Channel {
  prettyPrint?: string;
  name: string;
  id: string;
  description: string;
  isAdmin: boolean;
  isLoading?: boolean;
  withMissedMessages?: boolean;
  currentMessagesBatch?: number;
}

export type IdentityJSON = {
  PubKey: string;
  Codename: string;
  Color: string;
  Extension: string;
  CodesetVersion: number;
}

type MessageEvent = { id: string; handled: boolean; isUpdate: boolean };

let db: Dexie | undefined;
let storageTag: string;

const initDb = (tag = storageTag) => {
  if (!tag) { return; }
  storageTag = tag;
  db = new Dexie(`${tag}_speakeasy`);
  db.version(0.1).stores({
    channels: '++id',
    messages:
      '++id,channel_id,&message_id,parent_message_id,pinned,timestamp'
  });

  return db;
}

type NetworkContext = {
  // state
  bannedUsers: User[] | undefined;
  userIsBanned: (pubkey: string) => boolean;
  setBannedUsers: React.Dispatch<React.SetStateAction<User[] | undefined>>;
  channels: Channel[];
  messages: Message[];
  cmix?: CMix;
  currentChannel?: Channel;
  isNetworkHealthy: boolean | undefined;
  isReadyToRegister: boolean | undefined;
  networkStatus: NetworkStatus;
  channelIdentity: IdentityJSON | null;
  pinnedMessages?: Message[];
  // api
  checkRegistrationReadiness: (
    selectedPrivateIdentity: Uint8Array,
    onIsReadyInfoChange: (readinessInfo: IsReadyInfo) => void
  ) => Promise<void>;
  connectNetwork: () => Promise<void>;
  createChannel: (
    channelName: string,
    channelDescription: string,
    privacyLevel: 0 | 2
  ) => void;
  upgradeAdmin: () => void;
  deleteMessage: (message: Message) => Promise<void>;
  exportChannelAdminKeys: (encryptionPassword: string) => string;
  getCodeNameAndColor: (publicKey: string, codeSet: number) => { codename: string, color: string };
  generateIdentities: (amountOfIdentites: number) => {
    privateIdentity: Uint8Array;
    codename: string;
  }[];
  getMuted: () => boolean;
  joinChannel: (prettyPrint: string, appendToCurrent?: boolean) => void;
  importChannelAdminKeys: (encryptionPassword: string, privateKeys: string) => void;
  setPinnedMessages: React.Dispatch<React.SetStateAction<Message[] | undefined>>;
  fetchPinnedMessages: () => Promise<Message[]>;
  getBannedUsers: () => Promise<User[]>;
  mapDbMessagesToMessages: (messages: DBMessage[]) => Promise<Message[]>;
  muteUser: (pubkey: string, unmute: boolean) => Promise<void>;
  setMessages: (messages: Message[]) => void;
  setNetworkStatus: (status: NetworkStatus) => void;
  setCmix: (cmix: CMix) => void;
  setCurrentChannel: (channel: Channel) => void;
  shareChannel: () => void;
  sendMessage: (message: string) => void;
  leaveCurrentChannel: () => void;
  initiateCmix: (password: string) => Promise<void>;
  loadCmix: (statePassEncoded: Uint8Array) => Promise<CMix>;
  createChannelManager: (privateIdentity: Uint8Array) => Promise<void>;
  loadChannelManager: (storageTag: string, cmix?: CMix) => Promise<void>;
  handleInitialLoadData: (storageTag: string, manager: ChannelManager) => Promise<void>;
  getNickName: () => string;
  setNickName: (nickname: string) => boolean;
  getIdentity: () => IdentityJSON | null;
  sendReply: (reply: string, replyToMessageId: string) => Promise<void>;
  sendReaction: (reaction: string, reactToMessageId: string) => Promise<void>;
  getPrettyPrint: (channelId: string) => string | undefined;
  getShareURL: () => ShareURL | null;
  getShareUrlType: (url: string) => PrivacyLevel | null;
  joinChannelFromURL: (url: string, password: string) => void;
  getVersion: () => string | null;
  getClientVersion: () => string | null;
  loadMoreChannelData: (channelId: string) => Promise<void>;
  exportPrivateIdentity: (password: string) => Uint8Array | false;
  pinMessage: (message: Message, unpin?: boolean) => Promise<void>;
  setIsReadyToRegister: (isReady: boolean | undefined) => void;
  logout: (password: string) => boolean;
};

export const NetworkClientContext = React.createContext<NetworkContext>({
  cmix: undefined,
  networkStatus: NetworkStatus.DISCONNECTED,
  currentChannel: undefined,
  channels: [],
  messages: [],
  isNetworkHealthy: undefined,
  isReadyToRegister: undefined,
} as unknown as NetworkContext);

NetworkClientContext.displayName = 'NetworkClientContext';

const getPrettyPrint = (channelId: string) => {
  const prev = JSON.parse(localStorage.getItem('prettyprints') || '{}');
  return prev[channelId];
};

const savePrettyPrint = (channelId: string, prettyPrint: string) => {
  const prev = JSON.parse(localStorage.getItem('prettyprints') || '{}');

  prev[channelId] = prettyPrint;

  localStorage.setItem('prettyprints', JSON.stringify(prev));
};

export const NetworkProvider: FC<WithChildren> = props => {
  const {
    addStorageTag,
    setIsAuthenticated,
    statePathExists
  } = useAuthentication();
  const { messagePinned, messageReplied } = useNotification();
  const { utils } = useUtils();
  const [bannedUsers, setBannedUsers] = useState<User[]>();
  const [cmix, setNetwork] = useState<CMix | undefined>();
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(
    NetworkStatus.DISCONNECTED
  );
  const [messageQueue, setMessageQueue] = useState<MessageEvent[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | undefined>();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [channelManager, setChannelManager] = useState<ChannelManager | undefined>();

  const [isNetworkHealthy, setIsNetworkHealthy] = useState<boolean | undefined>(
    undefined
  );
  const [channelIdentity, setChannelIdentity] = useState<IdentityJSON | null>(null);
  
  const [isReadyToRegister, setIsReadyToRegister] = useState<
    boolean | undefined
  >(undefined);
  const bc = useMemo(() => new BroadcastChannel('join_channel'), []);
  const [blockedEvents, setBlockedEvents] = useState<DBMessage[]>([]);
  const currentCodeNameRef = useRef<string>('');
  const currentChannelRef = useRef<Channel>();
  const dummyTrafficObjRef = useRef<DummyTraffic>();
  const cipherRef = useRef<DatabaseCipher>();

  useEffect(() => {
    if (currentChannel) {
      currentChannelRef.current = currentChannel;
      setChannels(prev => {
        return prev.map((ch) => {
          if (ch?.id === currentChannel?.id) {
            return { ...ch, withMissedMessages: false };
          } else {
            return ch;
          }
        });
      });
    }
  }, [currentChannel]);

  const upgradeAdmin = useCallback(() => {
    if (currentChannel) {
      setCurrentChannel(ch => ch && ({
        ...ch,
        isAdmin: true,
      }))
      setChannels(prev => {
        return prev.map((ch) => {
          if (ch?.id === currentChannel?.id) {
            return { ...ch, isAdmin: true };
          } else {
            return ch;
          }
        });
      });
    }
  }, [currentChannel])

  const getIdentity = useCallback((mngr?: ChannelManager) => {
    const manager = channelManager || mngr; 
    try {
      const identity = decoder.decode(manager?.GetIdentity());


      return JSON.parse(identity) as IdentityJSON;
    } catch (error) {
      console.error(error);
      return null;
    }
  }, [channelManager]);


  useEffect(() => {
    if (currentChannel && !currentChannel?.isLoading) {
      const identity = getIdentity();
      setChannelIdentity(identity);
    }
  }, [currentChannel, getIdentity]);

  const connectNetwork = useCallback(async () => {
    if (cmix) {
      setNetworkStatus(NetworkStatus.CONNECTING);
      try {
        cmix.StartNetworkFollower(50000);
      } catch (error) {
        console.error('Error while StartNetworkFollower:', error);
      }

      try {
        await cmix.WaitForNetwork(10 * 60 * 1000);
        setNetworkStatus(NetworkStatus.CONNECTED);
      } catch (e) {
        console.error('Timed out. Network is not healthy.');
        setNetworkStatus(NetworkStatus.FAILED);
      }
    }
  }, [cmix]);
  
  const joinChannel = useCallback((
    prettyPrint: string,
    appendToCurrent = true
  ) => {
    if (prettyPrint && channelManager && channelManager.JoinChannel) {
      const chanInfo = JSON.parse(
        decoder.decode(channelManager.JoinChannel(prettyPrint))
      ) as ChannelJSON;

      if (appendToCurrent) {
        const temp: Channel = {
          id: chanInfo?.ChannelID,
          name: chanInfo?.Name,
          description: chanInfo?.Description,
          isAdmin: channelManager.IsChannelAdmin(utils.Base64ToUint8Array(chanInfo.ChannelID)),
          isLoading: true
        };
        setCurrentChannel(temp);
        setChannels(prev => [...prev, temp]);
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
      }
    }
  }, [channelManager, utils]);

  const getCodeNameAndColor = useCallback((publicKey: string, codeset: number) => {
    try {
      assert(utils && typeof utils.ConstructIdentity === 'function' && utils.Base64ToUint8Array)
      const identity = JSON.parse(
        decoder.decode(
          utils.ConstructIdentity(
            utils.Base64ToUint8Array(publicKey),
            codeset
          )
        )
      ) as IdentityJSON;

      return {
        codename: identity.Codename,
        color: identity.Color
      };
    } catch (error) {
      console.error('Failed to get codename and color', error);
      throw error;
    }
  }, [utils]);

  useEffect(() => {
    if (channelManager) {
      const identity = getIdentity();
      if (identity) {
        currentCodeNameRef.current = identity.Codename;
      }
      Cookies.set('userAuthenticated', 'true', { path: '/' });
    }
  }, [channelManager, getIdentity]);

  useEffect(() => {
    bc.onmessage = async event => {
      if (event.data?.prettyPrint) {
        try {
          joinChannel(event.data.prettyPrint);
        } catch (error) {}
      }
    };
  }, [bc, channelManager, joinChannel]);

  useEffect(() => {
    if (cmix) {
      setIsAuthenticated(true);
    }

    if (cmix && networkStatus !== NetworkStatus.CONNECTED) {
      connectNetwork();
    }
  }, [connectNetwork, cmix, networkStatus, setIsAuthenticated]);

  const mapDbMessagesToMessages = useCallback(async (msgs: DBMessage[]) => {
    initDb();

    if (!db || !(cipherRef && cipherRef.current)) {
      return [];
    } else {
      const messagesParentIds = msgs
        .map(e => e.parent_message_id)
        .filter((parentId): parentId is string => typeof parentId === 'string');

      const relatedMessages =
        (await db.table<DBMessage>('messages')
          .where('message_id')
          .anyOf(messagesParentIds)
          .filter(m => !m.hidden)
          .toArray()) || [];

      const mappedMessages: Message[] = [];

      msgs.forEach((m) => {
        if (m.parent_message_id && m.type === 1) {
          const replyToMessage = relatedMessages.find(
            ms => ms.message_id === m.parent_message_id
          );

          // If there is no replyTo message then it is not yet received
          if (!replyToMessage) {
            setBlockedEvents((e) => e.concat(m));
            return;
          }

          const {
            codename: messageCodeName,
            color: messageColor
          } = getCodeNameAndColor(m.pubkey, m.codeset_version);

          const {
            codename: replyToMessageCodeName,
            color: replyToMessageColor
          } = getCodeNameAndColor(
            replyToMessage.pubkey,
            replyToMessage.codeset_version
          );

          const resolvedMessage: Message = {
            id: m.message_id,
            body: decoder.decode(
              cipherRef?.current?.Decrypt(utils.Base64ToUint8Array(m.text))
            ),
            timestamp: m.timestamp,
            codename: messageCodeName,
            nickname: m.nickname || '',
            color: messageColor,
            channelId: m.channel_id,
            status: m.status,
            uuid: m.id,
            round: m.round,
            pubkey: m.pubkey,
            pinned: m.pinned,
            hidden: m.hidden,
            replyToMessage: {
              id: replyToMessage.message_id,
              body: decoder.decode(
                cipherRef?.current?.Decrypt(
                  utils.Base64ToUint8Array(replyToMessage.text)
                )
              ),
              timestamp: replyToMessage.timestamp,
              codename: replyToMessageCodeName,
              nickname: replyToMessage.nickname || '',
              color: replyToMessageColor,
              channelId: replyToMessage.channel_id,
              status: replyToMessage.status,
              uuid: replyToMessage.id,
              round: replyToMessage.round,
              pubkey: replyToMessage.pubkey,
              pinned: replyToMessage.pinned,
              hidden: replyToMessage.hidden
            }
          };
          mappedMessages.push(resolvedMessage);
        } else if (!m.parent_message_id) {
          // This is normal message
          const {
            codename: messageCodeName,
            color: messageColor
          } = getCodeNameAndColor(m.pubkey, m.codeset_version);
          const resolvedMessage: Message = {
            id: m.message_id,
            body: decoder.decode(
              cipherRef?.current?.Decrypt(utils.Base64ToUint8Array(m.text))
            ),
            timestamp: m.timestamp,
            codename: messageCodeName,
            nickname: m.nickname || '',
            color: messageColor,
            channelId: m.channel_id,
            status: m.status,
            uuid: m.id,
            round: m.round,
            pubkey: m.pubkey,
            pinned: m.pinned,
            hidden: m.hidden,
          };
          mappedMessages.push(resolvedMessage);
        }
      });
      return mappedMessages;
    }
  }, [getCodeNameAndColor, utils]);

  const handleReactionReceived = useCallback((dbMessage: DBMessage) => {
    setMessages((prevMessages) => {
      const destinationMessage = prevMessages.find(
        (m) => m.id === dbMessage.parent_message_id
      );
      if (destinationMessage) {
        const temp = destinationMessage;
        const emoji = decoder.decode(
          cipherRef?.current?.Decrypt(utils.Base64ToUint8Array(dbMessage.text))
        );

        const { codename } = getCodeNameAndColor(
          dbMessage.pubkey,
          dbMessage.codeset_version
        );
        // If no emojis map set it.
        if (!temp.emojisMap) {
          temp.emojisMap = new Map();
        }

        // If no key for this reaction set it with this username as the value
        if (!temp.emojisMap.has(emoji)) {
          temp.emojisMap.set(emoji, [codename]);
        } else {
          const previousInteractedUsers = temp.emojisMap.get(emoji) || [];
          // If emojisMap has this same interaction for this user before then delete it
          if (previousInteractedUsers?.includes(codename)) {
          } else {
            //else add it to the array
            previousInteractedUsers.push(codename);
            temp.emojisMap.set(emoji, previousInteractedUsers);
          }
        }
        return prevMessages.map(
          (m) => m.id === destinationMessage.id ? temp : m
        );
        
      } else {
        setBlockedEvents((e) => e.concat(dbMessage));

        return prevMessages;
      }
    });
  }, [getCodeNameAndColor, utils]);

  const updateSenderMessageStatus = useCallback((message: DBMessage) => {
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

  const resolveBlockedEvent = useCallback(async (event: DBMessage) => {
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

  const checkIfWillResolveBlockedEvent = useCallback((receivedMessage: DBMessage) => {
    const blockedEventsToResolve = blockedEvents.filter(
      e => e.parent_message_id === receivedMessage.message_id
    );

    if (blockedEventsToResolve?.length) {
      setBlockedEvents(
        (events) => events.filter(
          (e) => e.parent_message_id !== 
            blockedEventsToResolve[0].parent_message_id
        )
      );
      blockedEventsToResolve.forEach(e => {
        resolveBlockedEvent(e);
      });
    }
  }, [blockedEvents, resolveBlockedEvent]);

  const addEventToQueue = useCallback<MessageReceivedCallback>((id, _channel, update) => {
    setMessageQueue((msgs) => msgs.concat({ id, isUpdate: update, handled: false }))
  }, []);

  const handleMessageEvent = useCallback(async ({ id, isUpdate }: MessageEvent) => {
    if (db) {
      const receivedMessage = await db.table<DBMessage>('messages').get(id);

      if (receivedMessage?.hidden === true) {
        return;
      }

      if (isUpdate && receivedMessage) {
        if ([1, 2, 3].includes(receivedMessage.status)) {
          updateSenderMessageStatus(receivedMessage);
          return;
        }
      }

      if (receivedMessage?.parent_message_id
          && receivedMessage?.pubkey !== channelIdentity?.PubKey) {
        const replyingTo = await db.table<DBMessage>('messages').where('message_id').equals(receivedMessage?.parent_message_id).first();
        if (replyingTo?.pubkey === channelIdentity?.PubKey) {
          const { codename } = getCodeNameAndColor(receivedMessage.pubkey, receivedMessage.codeset_version);
          messageReplied(receivedMessage.nickname || codename, decoder.decode(
            cipherRef?.current?.Decrypt(utils.Base64ToUint8Array(receivedMessage.text))
          ))
        }
      }

      if (receivedMessage?.type === DBMessageType.Reaction) {
        // It's reaction event
        handleReactionReceived(receivedMessage);
      } else if (receivedMessage && receivedMessage?.type === DBMessageType.Normal) {
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
          setMessages((prev) => {
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
      if (receivedMessage) {
        checkIfWillResolveBlockedEvent(receivedMessage);
      }
    }
  }, [
    channelIdentity?.PubKey,
    checkIfWillResolveBlockedEvent,
    getCodeNameAndColor,
    handleReactionReceived,
    mapDbMessagesToMessages,
    messageReplied,
    updateSenderMessageStatus,
    utils
  ]);

  useEffect(() => {
    const event = messageQueue[messageQueue.length - 1];
    if (event) {
      setMessageQueue((events) => events.filter((e) => e.id !== event.id));
      handleMessageEvent(event);
    }
    
  }, [handleMessageEvent, messageQueue])

  const mapInitialLoadDataToCurrentState = useCallback(async (
    channs: DBChannel[],
    msgs: DBMessage[]
  ) => {
    const mappedChannels = channs.map((c) => {
      return { ...c }; // Find a way to get the pretty print for the returned channels
    });

    const mappedMessages = await mapDbMessagesToMessages(msgs);

    return { mappedChannels, mappedMessages };
  }, [mapDbMessagesToMessages]);

  // A function that takes DB messages, extract all reaction events then apply them to the passed IMessage[]
  // and return the results as IMessage[]
  const bulkUpdateMessagesWithReactions = useCallback((
    dbEvents: DBMessage[],
    msgs: Message[]
  ) => {
    const reactionEvents = dbEvents.filter(event => {
      return event.type === 3;
    });

    const messagesCopy = [...msgs];

    reactionEvents.forEach(event => {
      const emoji = decoder.decode(
        cipherRef?.current?.Decrypt(utils.Base64ToUint8Array(event.text))
      );

      const { codename  } = getCodeNameAndColor(
        event.pubkey,
        event.codeset_version
      );

      // const codename = event.codename;
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
          temp.emojisMap.set(emoji, [codename]);
        } else {
          const previousInteractedUsers = temp.emojisMap.get(emoji) || [];
          // If emojisMap has this same interaction for this user before then delete it
          if (previousInteractedUsers?.includes(codename)) {
          } else {
            //else add it to the array
            previousInteractedUsers.push(codename);
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
  const getDBReactionEvents = useCallback(async (events: DBMessage[]) => {
    if (db) {
      const eventsIds = events.map(e => e.message_id);
      const reactionEvents = await db
        .table('messages')
        .where('parent_message_id')
        .anyOf(eventsIds)
        .filter((e) => {
          return !e.hidden && e.type === 3;
        })
        .toArray();
      return reactionEvents;
    } else {
      return [];
    }
  }, []);

  const handleInitialLoadData = useCallback(async (tag: string, manager: ChannelManager) => {
    db = initDb(tag);

    assert(db);

    const fetchedChannels = await db.table<DBChannel>('channels').toArray();

    const channelsIds = fetchedChannels.map(ch => ch.id);

    const groupedMessages = await Promise.all(
      channelsIds.map(async chId => {
        if (!db) {
          throw new Error('Dexie initialization error');
        }

        return db.table<DBMessage>('messages')
          .orderBy('timestamp')
          .reverse()
          .filter(m => {
            return !m.hidden && m.channel_id === chId && m.type === 1;
          })
          .limit(batchCount)
          .toArray();
      })
    );
    let msgs: DBMessage[] = [];

    groupedMessages.forEach(g => {
      msgs = [...msgs, ..._.reverse(g)];
    });

    const result = await mapInitialLoadDataToCurrentState(
      fetchedChannels,
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
      mappedChannels.map((ch: DBChannel) => {
        return {
          ...ch,
          isAdmin: manager.IsChannelAdmin(utils.Base64ToUint8Array(ch.id)),
          currentMessagesBatch: 1
        };
      })
    );

    setMessages(messagesWithReactions);
  }, [
    bulkUpdateMessagesWithReactions,
    getDBReactionEvents,
    mapInitialLoadDataToCurrentState,
    utils
  ]);

  const loadChannelManager = async (tag: string, cmixFallback?: CMix) => {
    const currentNetwork = cmix || cmixFallback;

    if (
      currentNetwork &&
      cipherRef?.current &&
      utils &&
      utils.LoadChannelsManagerWithIndexedDb
    ) {
      const loadedChannelsManager = await utils
        .LoadChannelsManagerWithIndexedDb(
          currentNetwork.GetID(),
          tag,
          addEventToQueue,
          cipherRef?.current?.GetID()
        );

      setChannelManager(loadedChannelsManager);
      handleInitialLoadData(tag, loadedChannelsManager);
    }
  };

  const createChannelManager = useCallback(async (privateIdentity: Uint8Array) => {
    if (
      cmix &&
      cipherRef?.current &&
      utils &&
      utils.NewChannelsManagerWithIndexedDb
    ) {
      const createdChannelManager = await utils.NewChannelsManagerWithIndexedDb(
        cmix.GetID(),
        privateIdentity,
        addEventToQueue,
        cipherRef?.current?.GetID()
      );
      
      setChannelManager(createdChannelManager);
      const tag = createdChannelManager.GetStorageTag();
      addStorageTag(tag);
      handleInitialLoadData(tag, createdChannelManager);
    }
  }, [
    addStorageTag,
    handleInitialLoadData,
    cmix,
    addEventToQueue,
    utils
  ]);

  // Used directly on Login
  const loadCmix = useCallback(async (statePassEncoded: Uint8Array) => {
    let loadedCmix;
    try {
      loadedCmix = await utils.LoadCmix(
        STATE_PATH,
        statePassEncoded,
        utils.GetDefaultCMixParams()
      );

      try {
        dummyTrafficObjRef.current = utils.NewDummyTrafficManager(
          loadedCmix.GetID(),
          3,
          15000,
          7000
        );
      } catch (error) {
        console.error('error while creating the Dummy Traffic Object:', error);
      }

      const cipherObj = utils.NewChannelsDatabaseCipher(
        loadedCmix.GetID(),
        statePassEncoded,
        725
      );

      cipherRef.current = cipherObj;
      if (loadedCmix?.AddHealthCallback) {
        loadedCmix.AddHealthCallback({
          Callback: (isHealthy: boolean) => {
            if (isHealthy) {
              setIsNetworkHealthy(true);
              if (
                dummyTrafficObjRef &&
                dummyTrafficObjRef.current &&
                !dummyTrafficObjRef?.current?.GetStatus()
              ) {
                dummyTrafficObjRef?.current?.Start();
              }
            } else {
              setIsNetworkHealthy(false);
            }
          }
        });
      }
      
      setNetwork(loadedCmix);
      return loadedCmix;
    } catch (e) {
      console.error('Failed to load Cmix: ' + e);
      throw e;
    }
  }, [utils]);

  const initiateCmix = useCallback(async (password: string) => {
    try {
      const statePassEncoded = utils.GetOrInitPassword(password);
      // Check if state exists
      if (!statePathExists()) {
        // setStatePath('Test');
        await utils.NewCmix(ndf, STATE_PATH, statePassEncoded, '');
      }

      await loadCmix(statePassEncoded);
    } catch (error) {
      console.error('Failed to load Cmix: ' + error);
      throw error;
    }
  }, [utils, statePathExists, loadCmix]);

  useEffect(() => {
    if (!currentChannel && channels.length) {
      setCurrentChannel(channels[0]);
    }
  }, [channels, currentChannel]);

  const loadMoreChannelData = useCallback(async (chId: string) => {
    if (db) {
      const foundChannel = channels.find(ch => ch.id === chId);
      const currentChannelBatch = foundChannel?.currentMessagesBatch || 1;
      const newMessages = await db
        .table<DBMessage>('messages')
        .orderBy('timestamp')
        .reverse()
        .filter(m => {
          return !m.hidden && m.channel_id === chId && m.type === 1;
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

        setChannels((prevChannels: Channel[]) => {
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
      }
    }
  }, [
    bulkUpdateMessagesWithReactions,
    channels,
    getDBReactionEvents,
    mapInitialLoadDataToCurrentState
  ]);

  const joinChannelFromURL = useCallback((url: string, password = '') => {
    if (cmix && channelManager && channelManager.JoinChannelFromURL) {
      try {
        const chanInfo = JSON.parse(
          decoder.decode(channelManager.JoinChannelFromURL(url, password))
        );
        const temp = {
          id: chanInfo?.ChannelID,
          name: chanInfo?.Name,
          description: chanInfo?.Description,
          isAdmin: channelManager.IsChannelAdmin(utils.Base64ToUint8Array(chanInfo.ChannelID)),
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
      } catch (error) {
        console.error('Error joining channel')
      }
    } else {
      return null;
    }
  }, [channelManager, channels, cmix, utils]);

  const getChannelInfo = useCallback((prettyPrint: string) => {
    if (utils && utils.GetChannelInfo && prettyPrint.length) {
      return JSON.parse(decoder.decode(utils.GetChannelInfo(prettyPrint)));
    }
    return {};
  }, [utils]);


  const createChannel = useCallback(async (
    channelName: string,
    channelDescription: string,
    privacyLevel: PrivacyLevel.Public | PrivacyLevel.Secret
  ) => {
      if (cmix && channelName && channelManager) {
        const channelPrettyPrint = await channelManager?.GenerateChannel(
          channelName,
          channelDescription || '',
          privacyLevel,
        );
   
        const channelInfo = getChannelInfo(channelPrettyPrint || '') as ChannelJSON;
        const temp: Channel = {
          id: channelInfo?.ChannelID,
          name: channelInfo?.Name,
          isAdmin: true,
          description: channelInfo?.Description,
          prettyPrint: channelPrettyPrint,
          isLoading: false
        };
        joinChannel(channelPrettyPrint, false);
        savePrettyPrint(temp.id, channelPrettyPrint);
        setCurrentChannel(temp);
        setChannels([...channels, temp]);
      }
  }, [channelManager, channels, getChannelInfo, joinChannel, cmix]);

  const shareChannel = () => {};

  const leaveCurrentChannel = useCallback(async () => {
    if (currentChannel && channelManager && channelManager.LeaveChannel && utils) {
      try {
        channelManager.LeaveChannel(
          utils.Base64ToUint8Array(currentChannel.id)
        );
        const temp = currentChannel;
        const channelId = temp.id;
        setMessages(prev => {
          return prev.filter(m => m.channelId !== channelId);
        });
        setCurrentChannel(undefined);
        setChannels(
          channels.filter((c: Channel) => {
            return c.id != temp.id;
          })
        );
      } catch (error) {
        console.error('Failed to leave Channel.');
      }
    }
  }, [channelManager, channels, currentChannel, utils]);

  const sendMessage = useCallback(async (message: string) => {
    if (
      message.length &&
      channelManager &&
      utils &&
      utils.Base64ToUint8Array &&
      currentChannel
    ) {
      try {
        await channelManager.SendMessage(
          utils.Base64ToUint8Array(currentChannel.id),
          message,
          30000,
          new Uint8Array()
        );
      } catch (e) {
        console.error('Error sending message', e);
      }
    }
  }, [channelManager, currentChannel, utils]);

  const sendReply = useCallback(async (reply: string, replyToMessageId: string) => {
    if (
      reply.length &&
      channelManager &&
      utils &&
      utils.Base64ToUint8Array &&
      currentChannel
    ) {
      try {
        await channelManager.SendReply(
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
  }, [channelManager, currentChannel, utils]);

  const sendReaction = useCallback(async (reaction: string, reactToMessageId: string) => {
    if (channelManager && utils && utils.Base64ToUint8Array && currentChannel) {
      try {
        await channelManager.SendReaction(
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
  }, [channelManager, currentChannel, utils]);

  const setNickName = useCallback((nickName: string) => {
    if (channelManager?.SetNickname && currentChannel?.id) {
      try {
        channelManager?.SetNickname(
          nickName,
          utils.Base64ToUint8Array(currentChannel?.id)
        );
        return true;
      } catch (error) {
        return false;
      }
    }
    return false;
  }, [channelManager, currentChannel?.id, utils]);

  const getNickName = useCallback(() => {
    let nickName = '';
    if (channelManager?.GetNickname && currentChannel) {
      try {
        nickName = channelManager?.GetNickname(
          utils.Base64ToUint8Array(currentChannel?.id)
        );
      } catch (error) {
        nickName = '';
      }
    }
    return nickName;
  }, [channelManager, currentChannel, utils]);

  const getShareURL = useCallback(() => {
    if (
      cmix &&
      channelManager &&
      channelManager.GetShareURL &&
      utils &&
      utils.Base64ToUint8Array &&
      currentChannel
    ) {
      try {
        const currentHostName = window.location.host;
        const res = channelManager.GetShareURL(
          cmix?.GetID(),
          `http://${currentHostName}/join`,
          0,
          utils.Base64ToUint8Array(currentChannel.id)
        );
        
        return JSON.parse(decoder.decode(res)) as ShareURL;
      } catch (error) {
        return null;
      }
    } else {
      return null;
    }
  }, [channelManager, currentChannel, cmix, utils]);

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
  const generateIdentities = useCallback((amountOfIdentities: number) => {
    const identitiesObjects = [];
    if (utils && utils.GenerateChannelIdentity && cmix) {
      for (let i = 0; i < amountOfIdentities; i++) {
        const privateIdentity = utils.GenerateChannelIdentity(cmix?.GetID());
        const publicIdentity = utils.GetPublicChannelIdentityFromPrivate(
          privateIdentity
        );
        const identity = JSON.parse(decoder.decode(publicIdentity)) as IdentityJSON;
        const codename = identity.Codename;
        identitiesObjects.push({ privateIdentity, codename });
      }
    }
    return identitiesObjects;
  }, [cmix, utils])

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
          channelManager &&
          channelManager.ExportPrivateIdentity
        ) {
          const data = channelManager.ExportPrivateIdentity(password);
          exportDataToFile(data);
          return statePassEncoded;
        }
      } catch (error) {
        return false;
      }
    }
    return false;
  }, [channelManager, utils]);

  const checkRegistrationReadiness = useCallback((
    selectedPrivateIdentity: Uint8Array,
    onIsReadyInfoChange: (readinessInfo: IsReadyInfo) => void
  ) => {
    return new Promise<void>((resolve) => {
      const intervalId = setInterval(() => {
        if (cmix) {
          const isReadyInfo = JSON.parse(decoder.decode(cmix?.IsReady(0.7))) as IsReadyInfo;

          onIsReadyInfoChange(isReadyInfo);
          if (isReadyInfo.IsReady) {
            clearInterval(intervalId);
            setTimeout(() => {
              createChannelManager(selectedPrivateIdentity);
              setIsReadyToRegister(true);
              resolve();
            }, 3000);
          }
        }
      }, 1000);
    });
  }, [createChannelManager, cmix]);

  const logout = useCallback((password: string) => {
    if (utils && utils.Purge && cmix && cmix.StopNetworkFollower) {
      try {
        cmix.StopNetworkFollower();
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
        setChannelManager(undefined);
        setMessages([]);
        setBlockedEvents([]);
        currentCodeNameRef.current = '';
        currentChannelRef.current = undefined;
        dummyTrafficObjRef.current = undefined;
        cipherRef.current = undefined;

        return true;
      } catch (error) {
        console.error(error);
        // If something wrong happened like wrong password then we should start network follower again
        cmix.StartNetworkFollower(50000);
        return false;
      }
    } else {
      return false;
    }
  }, [cmix, setIsAuthenticated, utils]);

  const muteUser = useCallback(async (pubkey: string, muted: boolean) => {
    if (currentChannel) {
      await channelManager?.MuteUser(
        utils.Base64ToUint8Array(currentChannel?.id),
        utils.Base64ToUint8Array(pubkey),
        muted,
        utils.ValidForever(),
        utils.GetDefaultCMixParams()
      )
    }
  }, [channelManager, currentChannel, utils]);

  const deleteMessage = useCallback(async ({ channelId, id }: Message) => {
    await channelManager?.DeleteMessage(
      utils.Base64ToUint8Array(channelId),
      utils.Base64ToUint8Array(id),
      false,
      utils.GetDefaultCMixParams()
    );

    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, [channelManager, utils]);

  const getBannedUsers = useCallback(async () => {
    initDb();
    let users: User[] = [];

    if (currentChannel && channelManager && db) {
      const bannedUserIds = JSON.parse(decoder.decode(channelManager?.GetMutedUsers(
        utils.Base64ToUint8Array(currentChannel.id)
      ))) as string[];

      const usersMap = (await db.table<DBMessage>('messages')
        .filter((obj) => obj.channel_id === currentChannel.id && bannedUserIds.includes(obj.pubkey))
        .toArray() || []).reduce((acc, cur) => {
          if (bannedUserIds.includes(cur.pubkey) && !acc.get(cur.pubkey)) {
            const { codename: codename, color } = getCodeNameAndColor(cur.pubkey, cur.codeset_version);
            acc.set(
              cur.pubkey, {
                codename,
                color,
                pubkey: cur.pubkey
              }
            );
          }
          return acc;
        }, new Map<string, User>()).values();
      
      users = Array.from(usersMap);
      setBannedUsers(users);
    }

    return users;
  }, [channelManager, currentChannel, getCodeNameAndColor, utils]);

  useEffect(() => {
    getBannedUsers();
  }, [currentChannel, getBannedUsers]);

  const userIsBanned = useCallback(
    (pubkey: string) => !!bannedUsers?.find((u) => u.pubkey === pubkey),
    [bannedUsers]
  );

  const pinMessage = useCallback(async ({ id }: Message, unpin = false) => {
    if (currentChannel && channelManager) {
      await channelManager.PinMessage(
        utils.Base64ToUint8Array(currentChannel?.id),
        utils.Base64ToUint8Array(id),
        unpin,
        PIN_MESSAGE_LENGTH_MILLISECONDS,
        utils.GetDefaultCMixParams()
      )
    }
  }, [channelManager, currentChannel, utils]);

  const [pinnedMessages, setPinnedMessages] = useState<Message[]>();

  const fetchPinnedMessages = useCallback(async (): Promise<Message[]> => {
    if (db && currentChannel) {
      const fetchedPinnedMessages = await db.table<DBMessage>('messages')
        .filter((m) => m.pinned && !m.hidden && m.channel_id === currentChannel.id)
        .toArray()
        .then(mapDbMessagesToMessages);
      
        setPinnedMessages(fetchedPinnedMessages);

      return fetchedPinnedMessages;
    }
    return [];
  }, [currentChannel, mapDbMessagesToMessages]);

  const getMuted = useCallback(() => {
    if (currentChannel && channelManager) {
      return channelManager?.Muted(utils.Base64ToUint8Array(currentChannel.id))
    }
    return false;
  }, [channelManager, currentChannel, utils]);

  const previouslyPinned = usePrevious(pinnedMessages);
  const previousChannel = usePrevious(currentChannel);
  const [notified, setNotified] = useState<string[]>([]);

  useEffect(() => {
    if (currentChannel) {
      setPinnedMessages(undefined);
      fetchPinnedMessages();
    }
  }, [currentChannel, fetchPinnedMessages]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchPinnedMessages();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchPinnedMessages]);


  useEffect(() => {
    const notInitialLoad = previouslyPinned !== undefined;

    if (notInitialLoad && pinnedMessages) {
      const previouslyPinnedIds = previouslyPinned?.map((message) => message.id);
      const newPinnedMessages = pinnedMessages
        .filter(({ id }) => !previouslyPinnedIds.includes(id) && !notified.includes(id));
      if (newPinnedMessages.length > 0) {
        setNotified((notifieds) => notifieds.concat(newPinnedMessages.map((m) => m.id)))
        newPinnedMessages.forEach((m) => {
          const foundChannel = channels.find((c) => c.id === m.channelId);
          if (foundChannel) {
            messagePinned(m.body, foundChannel.name);
          }
        });
      }
    }
  }, [
    channels,
    currentChannel,
    messagePinned,
    notified,
    pinnedMessages,
    previousChannel?.id,
    previouslyPinned
  ]);

  const exportChannelAdminKeys = useCallback((encryptionPassword: string) => {
    if (channelManager && currentChannel) {
      return decoder.decode(channelManager.ExportChannelAdminKey(
        utils.Base64ToUint8Array(currentChannel.id),
        encryptionPassword
      ));
    }
    throw Error('Channel manager and current channel required.');
  }, [channelManager, currentChannel, utils]);


  const importChannelAdminKeys = useCallback((encryptionPassword: string, privateKey: string) => {
    if (channelManager && currentChannel) {
      channelManager.ImportChannelAdminKey(
        utils.Base64ToUint8Array(currentChannel.id),
        encryptionPassword,
        encoder.encode(privateKey)
      );
    } else {
      throw Error('Channel manager and current channel required.');
    }
  }, [channelManager, currentChannel, utils]);

  const ctx: NetworkContext = {
    channelIdentity,
    getBannedUsers,
    bannedUsers,
    exportChannelAdminKeys,
    importChannelAdminKeys,
    userIsBanned,
    setBannedUsers,
    muteUser,
    getMuted,
    cmix,
    deleteMessage,
    setCmix: setNetwork,
    fetchPinnedMessages,
    networkStatus,
    setNetworkStatus,
    joinChannel,
    createChannel,
    shareChannel,
    channels,
    messages,
    setMessages,
    currentChannel,
    mapDbMessagesToMessages,
    setCurrentChannel,
    sendMessage,
    leaveCurrentChannel,
    generateIdentities: generateIdentities,
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
    pinnedMessages,
    setPinnedMessages,
    getVersion,
    getClientVersion,
    loadMoreChannelData,
    exportPrivateIdentity,
    getCodeNameAndColor,
    isNetworkHealthy,
    isReadyToRegister,
    setIsReadyToRegister,
    checkRegistrationReadiness,
    pinMessage,
    logout,
    upgradeAdmin
  }

  return (
    <NetworkClientContext.Provider
      value={ctx}
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

export const ManagedNetworkContext: FC<WithChildren> = ({ children }) => (
  <NetworkProvider>{children}</NetworkProvider>
);
