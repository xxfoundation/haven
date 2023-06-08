import type { CMix, DBMessage, DBChannel, ChannelJSON, ShareURLJSON, IsReadyInfoJSON, MessageReceivedEvent, NotificationLevel, NotificationStatus, DMClient } from 'src/types';
import type { WithChildren, Message } from 'src/types';
import { MessageStatus, MessageType } from 'src/types';

import React, { FC, useState, useEffect,  useCallback, useMemo } from 'react';

import _ from 'lodash';
import Cookies from 'js-cookie';
import assert from 'assert';

import { bus, onMessagePinned, onMessageUnpinned, handleChannelEvent, ChannelEvents, AppEvents } from 'src/events';

import { decoder, encoder, exportDataToFile, inflate } from 'src/utils';
import { useAuthentication } from 'src/contexts/authentication-context';
import { PrivacyLevel, useUtils } from 'src/contexts/utils-context';
import { MESSAGE_LEASE, PIN_MESSAGE_LENGTH_MILLISECONDS, STATE_PATH, CHANNELS_WORKER_JS_PATH, CMIX_NETWORK_READINESS_THRESHOLD } from '../constants';
import useNotification from 'src/hooks/useNotification';
import { useDb } from './db-context';
import useCmix, { NetworkStatus } from 'src/hooks/useCmix';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';

import * as app from 'src/store/app';
import * as channels from 'src/store/channels'
import * as identity from 'src/store/identity';
import * as messages from 'src/store/messages';
import * as dms from 'src/store/dms';
import { ChannelId, Channel } from 'src/store/channels/types';
import usePagination from 'src/hooks/usePagination';
import useDmClient from 'src/hooks/useDmClient';
import { channelDecoder, identityDecoder, isReadyInfoDecoder, pubkeyArrayDecoder, shareUrlDecoder, versionDecoder } from '@utils/decoders';
import { RemoteStore } from 'src/types/collective';
import useChannelsStorageTag from 'src/hooks/useChannelsStorageTag';

const BATCH_COUNT = 1000;

export type User = {
  codename: string;
  codeset: number;
  color: string;
  pubkey: string;
}

export type DatabaseCipher = {
  GetID: () => number;
  Decrypt: (plaintext: Uint8Array) => Uint8Array;
}

export type ChannelManager = {
  GetID: () => number;
  AreDMsEnabled: (channelId: Uint8Array) => boolean;
  DisableDirectMessages: (channelId: Uint8Array) => void;
  EnableDirectMessages: (channelId: Uint8Array) => void;
  JoinChannel: (prettyPrint: string) => Promise<Uint8Array>;
  LeaveChannel: (channelId: Uint8Array) => Promise<void>;
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
    cmixParams: Uint8Array,
    tags: Uint8Array
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
    cmixParams: Uint8Array
  ) => Promise<void>;
  SendReaction: (
    channelId: Uint8Array,
    reaction: string,
    messageToReactTo: Uint8Array,
    messageValidityTimeoutMilliseconds: number,
    cmixParams: Uint8Array
  ) => Promise<Uint8Array>;
  SendReply: (
    channelId: Uint8Array,
    message: string,
    messageToReactTo: Uint8Array,
    messageValidityTimeoutMilliseconds: number,
    cmixParams: Uint8Array,
    tags: Uint8Array
  ) => Promise<Uint8Array>;
  IsChannelAdmin: (channelId: Uint8Array) => boolean;
  GetNotificationLevel: (channelId: Uint8Array) => NotificationLevel;
  SetMobileNotificationsLevel: (channelId: Uint8Array, notificationLevel: NotificationLevel, notificationStatus: NotificationStatus) => void;
  GenerateChannel: (channelname: string, description: string, privacyLevel: PrivacyLevel) => Promise<string>;
  GetStorageTag: () => string | undefined;
  SetNickname: (newNickname: string, channel: Uint8Array) => void;
  GetNickname: (channelId: Uint8Array) => string;
  GetIdentity: () => Uint8Array;
  GetShareURL: (cmixId: number, host: string, maxUses: number, channelId: Uint8Array) => Uint8Array;
  JoinChannelFromURL: (url: string, password: string) => Uint8Array;
  ExportPrivateIdentity: (password: string) => Uint8Array;
  ExportChannelAdminKey: (channelId: Uint8Array, encryptionPassword: string) => Uint8Array;
  ImportChannelAdminKey: (channelId: Uint8Array, encryptionPassword: string, privateKey: Uint8Array) => void;
}

export type NetworkContext = {
  // state
  mutedUsers: User[] | undefined;
  setMutedUsers: React.Dispatch<React.SetStateAction<User[] | undefined>>;
  cmix?: CMix;
  networkStatus?: NetworkStatus;
  isNetworkHealthy: boolean | undefined;
  // api
  checkRegistrationReadiness: (
    selectedPrivateIdentity: Uint8Array,
    onIsReadyInfoChange: (readinessInfo: IsReadyInfoJSON) => void
  ) => Promise<void>;
  pagination: ReturnType<typeof usePagination>;
  createChannel: (
    channelName: string,
    channelDescription: string,
    privacyLevel: 0 | 2,
    enableDms: boolean
  ) => void;
  dmClient?: DMClient;
  decryptMessageContent?: (text: string) => string;
  upgradeAdmin: () => void;
  deleteMessage: (message: Pick<Message, 'id' | 'channelId'>) => Promise<void>;
  exportChannelAdminKeys: (encryptionPassword: string) => string;
  generateIdentities: (amountOfIdentites: number) => {
    codename: string,
    privateIdentity: Uint8Array,
    codeset: number
    pubkey: string,
  }[];
  joinChannel: (prettyPrint: string, appendToCurrent?: boolean, enabledms?: boolean) => void;
  importChannelAdminKeys: (encryptionPassword: string, privateKeys: string) => void;
  getMutedUsers: () => Promise<User[]>;
  muteUser: (pubkey: string, unmute: boolean) => Promise<void>;
  shareChannel: () => void;
  sendMessage: (message: string, tags?: string[]) => void;
  leaveCurrentChannel: () => void;
  createChannelManager: (privateIdentity: Uint8Array) => Promise<void>;
  loadChannelManager: (storageTag: string, cmix?: CMix) => Promise<void>;
  handleInitialLoadData: () => Promise<void>;
  getNickName: () => string;
  setNickname: (nickname: string) => boolean;
  sendReply: (reply: string, replyToMessageId: string, tags?: string[]) => Promise<void>;
  sendReaction: (reaction: string, reactToMessageId: string) => Promise<void>;
  getPrettyPrint: (channelId: string) => string | undefined;
  getShareURL: (channelId: string) => ShareURLJSON | null;
  getShareUrlType: (url: string) => PrivacyLevel | null;
  joinChannelFromURL: (url: string, password: string) => void;
  getVersion: () => string | null;
  getClientVersion: () => string | null;
  loadMoreChannelData: (channelId: string) => Promise<void>;
  exportPrivateIdentity: (password: string) => Uint8Array | false;
  pinMessage: (message: Message, unpin?: boolean) => Promise<void>;
  logout: (password: string) => boolean;
  channelManager?: ChannelManager;
  remoteStore?: RemoteStore;
  fetchChannels: () => Promise<Channel[]>;
};

export const NetworkClientContext = React.createContext<NetworkContext>({
  cmix: undefined,
  networkStatus: NetworkStatus.DISCONNECTED,
  currentChannel: undefined,
  channels: [],
  messages: [],
  isNetworkHealthy: undefined,
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
  const { encryptedPassword, rawPassword } = useAuthentication();
  const pagination = usePagination();
  const dispatch = useAppDispatch();
  const db = useDb();
  const { setIsAuthenticated } = useAuthentication();
  const { set: setStorageTag, value: storageTag } = useChannelsStorageTag();
  const { messagePinned, messageReplied, notifyMentioned } = useNotification();
  const { getCodeNameAndColor, utils } = useUtils();
  const [mutedUsers, setMutedUsers] = useState<User[]>();
  const {
    cipher,
    cmix,
    disconnect,
    id: cmixId,
    remoteStore,
    status: cmixStatus
  } = useCmix();
  const [channelManager, setChannelManager] = useState<ChannelManager | undefined>();
  const bc = useMemo(() => new BroadcastChannel('join_channel'), []);
  const allMessagesByChannelId = useAppSelector((state) => state.messages.byChannelId);
  const currentChannelPages = useAppSelector(channels.selectors.channelPages);
  const currentConversationId = useAppSelector(app.selectors.currentChannelOrConversationId);
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const currentChannels = useAppSelector(channels.selectors.channels);
  const currentMessages = useAppSelector(messages.selectors.currentChannelMessages);
  const currentConversation = useAppSelector(dms.selectors.currentConversation);

  const userIdentity = useAppSelector(identity.selectors.identity);
  const privateIdentity = useMemo(
    () => (channelManager && rawPassword)
      ? utils.ImportPrivateIdentity(rawPassword, channelManager.ExportPrivateIdentity(rawPassword))
      : undefined,
    [channelManager, rawPassword, utils]
  );

  const dmClient = useDmClient(cmixId, privateIdentity, encryptedPassword);

  const upgradeAdmin = useCallback(() => {
    if (currentChannel?.id) {
      dispatch(channels.actions.updateAdmin({ channelId: currentChannel.id }));
    }
  }, [dispatch, currentChannel])

  const fetchIdentity = useCallback((mngr?: ChannelManager) => {
    const manager = channelManager || mngr;
    try {
      const json = decoder.decode(manager?.GetIdentity());

      const parsed = identityDecoder(JSON.parse(json));

      dispatch(identity.actions.set({
        codename: parsed.codename,
        pubkey: parsed.pubkey,
        codeset: parsed.codeset,
        color: parsed.color.replace('0x', '#'),
        extension: parsed.extension
      }));
    } catch (error) {
      console.error(error);
      return null;
    }
  }, [channelManager, dispatch]);

  const getShareURL = useCallback((
    channelId: string,
  ) => {
    if (
      cmix &&
      channelManager &&
      utils &&
      utils.Base64ToUint8Array &&
      channelId
    ) {
      try {
        const currentHostName = window.location.host;
        const res = channelManager.GetShareURL(
          cmix?.GetID(),
          `http://${currentHostName}/join`,
          0,
          utils.Base64ToUint8Array(channelId)
        );
        
        return shareUrlDecoder(JSON.parse(decoder.decode(res)));
      } catch (error) {
        return null;
      }
    } else {
      return null;
    }
  }, [channelManager, cmix, utils]);

  const getShareUrlType = useCallback((url?: string) => {
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

  const getPrivacyLevel = useCallback(
    (channelId: string) => getShareUrlType(getShareURL(channelId)?.url),
    [getShareURL, getShareUrlType]
  );
  
  const joinChannel = useCallback(async (
    prettyPrint: string,
    appendToCurrent = true,
    enableDms = true,
  ) => {
    if (prettyPrint && channelManager && channelManager.JoinChannel) {
      let chanInfo = channelDecoder(JSON.parse(decoder.decode(utils.GetChannelJSON(prettyPrint))));

      if (currentChannels.find((c) => c.id === chanInfo.receptionId)) {
        return;
      }

      chanInfo = channelDecoder(JSON.parse(
        decoder.decode(await channelManager.JoinChannel(prettyPrint))
      ));

      if (chanInfo.channelId === undefined) {
        throw new Error('ChannelID was not found');
      }

      const channel: Channel = {
        id: chanInfo.receptionId || chanInfo.channelId,
        name: chanInfo.name,
        privacyLevel: getPrivacyLevel(chanInfo.receptionId ||chanInfo.channelId),
        description: chanInfo.description,
        isAdmin: channelManager.IsChannelAdmin(utils.Base64ToUint8Array(chanInfo.channelId)),
      };

      if (appendToCurrent) {
        dispatch(channels.actions.upsert(channel));
        dispatch(app.actions.selectChannel(channel.id));
      }

      if (enableDms) {
        channelManager.EnableDirectMessages(utils.Base64ToUint8Array(channel.id));
      } else {
        channelManager.DisableDirectMessages(utils.Base64ToUint8Array(channel.id));
      }
    }
  }, [channelManager, currentChannels, dispatch, getPrivacyLevel, utils]);

  useEffect(() => {
    bc.onmessage = async event => {
      if (event.data) {
        try {
          await joinChannel(event.data.prettyPrint, true, event.data.dmsEnabled);
        } catch (error) {}
      }
    };
  }, [bc, channelManager, joinChannel]);


  useEffect(() => {
    if (currentChannel && channelManager) {
      dispatch(channels.actions.updateDmsEnabled({
        channelId: currentChannel.id,
        enabled: channelManager.AreDMsEnabled(utils.Base64ToUint8Array(currentChannel.id))
      }))
    }
    }, [channelManager, currentChannel, dispatch, utils]);

  const dbMessageMapper = useCallback((dbMsg: DBMessage): Message => {
    assert(cipher, 'Cipher required');
    return {
      ...getCodeNameAndColor(dbMsg.pubkey, dbMsg.codeset_version),
      id: dbMsg.message_id,
      body: cipher.decrypt(dbMsg.text) ?? undefined,
      repliedTo: dbMsg.parent_message_id,
      type: dbMsg.type,
      timestamp: dbMsg.timestamp,
      nickname: dbMsg.nickname || '',
      channelId: dbMsg.channel_id,
      status: dbMsg.status,
      uuid: dbMsg.id,
      round: dbMsg.round,
      pubkey: dbMsg.pubkey,
      pinned: dbMsg.pinned,
      hidden: dbMsg.hidden,
      codeset: dbMsg.codeset_version,
      dmToken: dbMsg.dm_token === 0 ? undefined : dbMsg.dm_token
    }
  }, [cipher, getCodeNameAndColor]);

  const fetchRepliedToMessages = useCallback(async (messagesWhoseRepliesToFetch: Message[]) => {
    if (db) {
      const messagesParentIds = messagesWhoseRepliesToFetch
        .map(e => e.repliedTo)
        .filter((repliedTo): repliedTo is string => typeof repliedTo === 'string');

      const relatedMessages =
        (await db.table<DBMessage>('messages')
          .where('message_id')
          .anyOf(messagesParentIds)
          .filter(m => !m.hidden)
          .toArray()) || [];

      dispatch(messages.actions.upsertMany(relatedMessages.map(dbMessageMapper)));
    }
  }, [db, dbMessageMapper, dispatch]);

  const handleMessageEvent = useCallback(async ({ uuid }: MessageReceivedEvent) => {
    if (db && cipher?.decrypt) {
      const receivedMessage = await db.table<DBMessage>('messages').get(uuid);

      if (!receivedMessage) {
        return;
      }
      
      const decryptedText = cipher.decrypt(receivedMessage.text);

      // Notify user if message mentions him/her/they/banana
      if (receivedMessage.status === MessageStatus.Delivered) {
        const inflatedText = inflate(decryptedText);
        const mentions = new DOMParser()
          .parseFromString(inflatedText, 'text/html')
          .getElementsByClassName('mention');
  
        for (let i = 0; i < mentions.length; i++) {
          const mention = mentions[i];
          const mentionedPubkey = mention.getAttribute('data-id');
  
          if (mentionedPubkey === userIdentity?.pubkey) {
            const { codename } = getCodeNameAndColor(receivedMessage.pubkey, receivedMessage.codeset_version);
            notifyMentioned(
              receivedMessage.nickname || codename,
              decryptedText
            );
            break;
          }
        }
      }

      if (
          receivedMessage?.type !== MessageType.Reaction && // Remove emoji reactions, Ben thinks theyre annoying
          receivedMessage?.parent_message_id
          && receivedMessage?.pubkey !== userIdentity?.pubkey) {
        const replyingTo = await db.table<DBMessage>('messages')
          .where('message_id')
          .equals(receivedMessage?.parent_message_id)
          .first();
        if (replyingTo?.pubkey === userIdentity?.pubkey) {
          const { codename } = getCodeNameAndColor(receivedMessage.pubkey, receivedMessage.codeset_version);
          messageReplied(
            receivedMessage.nickname || codename,
            decryptedText
          )
        }
      }

      const oldMessage = allMessagesByChannelId[receivedMessage?.channel_id]?.[receivedMessage.id];

      // notify new pinned messages
      if (!oldMessage?.pinned && receivedMessage?.pinned) {
        const foundChannel = currentChannels.find(({ id }) => receivedMessage.channel_id === id);
        onMessagePinned(dbMessageMapper(receivedMessage));
        messagePinned(
          decryptedText,
          foundChannel?.name ?? 'unknown'
        );
      }

      if (oldMessage?.pinned && !receivedMessage.pinned) {
        onMessageUnpinned(dbMessageMapper(receivedMessage));
      }

      if (receivedMessage) {
        const mappedMessage = dbMessageMapper(receivedMessage);
        dispatch(messages.actions.upsert(mappedMessage));

        if (receivedMessage.channel_id !== currentChannel?.id) {
          dispatch(app.actions.notifyNewMessage(mappedMessage))
        }
      }
    }
  }, [
    allMessagesByChannelId,
    cipher,
    currentChannel?.id,
    currentChannels,
    db,
    dbMessageMapper,
    dispatch,
    getCodeNameAndColor,
    notifyMentioned,
    messagePinned,
    messageReplied,
    userIdentity?.pubkey
  ]);

  useEffect(() => {
    bus.addListener(ChannelEvents.MESSAGE_RECEIVED, handleMessageEvent);

    return () => { bus.removeListener(ChannelEvents.MESSAGE_RECEIVED, handleMessageEvent) };
  }, [handleMessageEvent]);

  const fetchChannels = useCallback(async () => {
    assert(db);
    assert(channelManager);
    
    const fetchedChannels = await db.table<DBChannel>('channels').toArray();

    const channelList = fetchedChannels.map((ch: DBChannel) => ({
      ...ch,
      privacyLevel: getPrivacyLevel(ch.id),
      isAdmin: channelManager.IsChannelAdmin(utils.Base64ToUint8Array(ch.id)),
    }));

    channelList.forEach((channel) => dispatch(channels.actions.upsert(channel)))

    return channelList;
  }, [
    channelManager,
    db,
    dispatch,
    getPrivacyLevel,
    utils
  ]);

  const fetchMessages = useCallback(async (channelIds: ChannelId[]) => {
    const groupedMessages = await Promise.all(
      channelIds.map(async chId => {
        if (!db) {
          throw new Error('Dexie initialization error');
        }

        return db.table<DBMessage>('messages')
          .orderBy('timestamp')
          .reverse()
          .filter(m =>  !m.hidden && m.channel_id === chId && m.type === 1)
          .limit(BATCH_COUNT)
          .toArray();
      })
    );

    let msgs: DBMessage[] = [];

    groupedMessages.forEach(g => {
      msgs = [...msgs, ..._.reverse(g)];
    });

    const mappedMessages = msgs.map(dbMessageMapper);

    dispatch(messages.actions.upsertMany(mappedMessages));

    return mappedMessages;
  }, [db, dbMessageMapper, dispatch]);

  const fetchReactions = useCallback(async () => {
    if (currentChannel?.id !== undefined) {
      const channelReactions = await db?.table<DBMessage>('messages')
        .where('channel_id')
        .equals(currentChannel?.id)
        .filter((e) =>  !e.hidden && e.type === MessageType.Reaction)
        .toArray() ?? [];
        
      const reactions = channelReactions?.filter((r) => r.parent_message_id !== null)
        .map(dbMessageMapper);

      dispatch(messages.actions.upsertMany(reactions));
    }
  }, [currentChannel?.id, db, dbMessageMapper, dispatch]);

  const fetchPinnedMessages = useCallback(async (): Promise<void> => {
    if (db && currentChannel) {
      const fetchedPinnedMessages = (await db.table<DBMessage>('messages')
        .where('channel_id')
        .equals(currentChannel.id)
        .filter((m) => m.pinned && !m.hidden)
        .toArray())
        .map(dbMessageMapper);
      
      dispatch(messages.actions.upsertMany(fetchedPinnedMessages));
    }
  }, [currentChannel, db, dbMessageMapper, dispatch]);

  const fetchInitialData = useCallback(async () => {
    try {
      assert(db);
      assert(cmix);
      assert(channelManager);
    } catch (e) {
      return;
    }
    fetchIdentity();
    const fetchedChannels = await fetchChannels();
    const channelMessages = await fetchMessages(fetchedChannels.map((ch) => ch.id));
    fetchRepliedToMessages(channelMessages);

  }, [
    channelManager,
    cmix,
    db,
    fetchChannels,
    fetchIdentity,
    fetchMessages,
    fetchRepliedToMessages
  ]);

  useEffect(() => {
    if (!currentChannel && currentChannels.length > 0 && currentConversationId === null) {
      dispatch(app.actions.selectChannel(currentChannels[0]?.id));
    }
  }, [currentChannel, currentChannels, currentConversationId, dispatch])

  useEffect(() => {
    if (db && channelManager && cmix) {
      fetchInitialData();
    }
  }, [db, cmix, channelManager, fetchInitialData]);

  useEffect(() => {
    if (currentChannel?.id !== undefined) {
      fetchPinnedMessages();
      fetchReactions();
    }
  }, [currentChannel?.id, fetchPinnedMessages, fetchReactions]);

  useEffect(() => {
    if (currentChannel?.id && channelManager) {
      // const encodedChannelId = utils.Base64ToUint8Array(currentChannel.id);
      // const level = channelManager.GetNotificationLevel(encodedChannelId);
      // dispatch(channels.actions.updateNotificationLevel({ channelId: currentChannel.id, level }));
    }
  }, [channelManager, currentChannel, dispatch, utils])


  const loadChannelManager = useCallback(async (tag: string) => {
    if (
      cmixId !== undefined &&
      cipher &&
      utils
    ) {
      const notifications = utils.LoadNotificationsDummy(cmixId);
      const loadedChannelsManager = await utils
        .LoadChannelsManagerWithIndexedDb(
          cmixId,
          '/integrations/assets/channelsIndexedDbWorker.js',
          tag,
          new Uint8Array(),
          notifications.GetID(),
          {
            EventUpdate: handleChannelEvent
          },
          cipher?.id
        );

      setChannelManager(loadedChannelsManager);
      bus.emit(AppEvents.CHANNEL_MANAGER_LOADED);
    }
  }, [cipher, cmixId, utils]);

  useEffect(() => {
    if (cmix && cipher && utils && storageTag) {
      loadChannelManager(storageTag);
    }
  }, [cipher, cmix, loadChannelManager, storageTag, utils]);

  const getMutedUsers = useCallback(async () => {
    let users: User[] = [];

    if (currentChannel && channelManager && db) {
      const mutedUserIds = pubkeyArrayDecoder(JSON.parse(decoder.decode(channelManager?.GetMutedUsers(
        utils.Base64ToUint8Array(currentChannel.id)
      ))));

      dispatch(channels.actions.setMutedUsers({
        channelId: currentChannel.id,
        mutedUsers: mutedUserIds
      }));

      const usersMap = (await db.table<DBMessage>('messages')
        .filter((obj) => obj.channel_id === currentChannel.id && mutedUserIds.includes(obj.pubkey))
        .toArray() || []).reduce((acc, cur) => {
          if (mutedUserIds.includes(cur.pubkey) && !acc.get(cur.pubkey)) {
            const { codename: codename, color } = getCodeNameAndColor(cur.pubkey, cur.codeset_version);
            acc.set(
              cur.pubkey, {
                codename,
                color,
                pubkey: cur.pubkey,
                codeset: cur.codeset_version
              }
            );
          }
          return acc;
        }, new Map<string, User>()).values();
      
      users = Array.from(usersMap);
    }

    return users;
  }, [channelManager, currentChannel, db, dispatch, getCodeNameAndColor, utils]);

  const createChannelManager = useCallback(async (privIdentity: Uint8Array) => {
    if (
      cmixId !== undefined &&
      cipher &&
      utils &&
      utils.NewChannelsManagerWithIndexedDb
    ) {
      const notifications = utils.LoadNotificationsDummy(cmixId);
      const createdChannelManager = await utils.NewChannelsManagerWithIndexedDb(
        cmixId,
        CHANNELS_WORKER_JS_PATH,
        privIdentity,
        new Uint8Array(),
        notifications.GetID(),
        { EventUpdate: handleChannelEvent },
        cipher.id
      );
      
      setChannelManager(createdChannelManager);

      const tag = createdChannelManager.GetStorageTag();
      if (tag) {
        setStorageTag(tag);
      }
    }
  }, [cmixId, cipher, utils, setStorageTag]);

  const [hasMore, setHasMore] = useState(true);

  useEffect(() => { setHasMore(true); }, [currentChannel?.id])

  const loadMoreChannelData = useCallback(async (chId: string) => {
    if (db) {
      const foundChannel = currentChannels.find(ch => ch.id === chId);
      if (foundChannel) {
        const offset = (currentChannelPages[foundChannel.id] + 1) * BATCH_COUNT;

        const newMessages = await db
          .table<DBMessage>('messages')
          .orderBy('timestamp')
          .reverse()
          .filter(m => {
            return !m.hidden && m.channel_id === chId && m.type === 1;
          })
          .offset(offset)
          .limit(BATCH_COUNT)
          .toArray();
        
        if (newMessages.length > 0) {
          dispatch(channels.actions.incrementPage(chId));
          dispatch(messages.actions.upsertMany(newMessages.map(dbMessageMapper)));
        } else {
          setHasMore(false);
        }
      }
    }
  }, [db, currentChannels, currentChannelPages, dispatch, dbMessageMapper]);

  useEffect(() => {
    if (currentChannel?.id !== undefined && pagination.end >= (currentMessages?.length ?? 0) && hasMore) {
      loadMoreChannelData(currentChannel?.id);
    }
  }, [
    currentChannel?.id,
    currentMessages?.length,
    hasMore,
    loadMoreChannelData,
    pagination.end
  ])

  const joinChannelFromURL = useCallback((url: string, password = '') => {
    if (channelManager && channelManager.JoinChannelFromURL) {
      try {
        const chanInfo = channelDecoder(JSON.parse(
          decoder.decode(channelManager.JoinChannelFromURL(url, password))
        ));

        if (chanInfo && chanInfo?.channelId) {
          dispatch(channels.actions.upsert({
            id: chanInfo?.channelId,
            name: chanInfo?.name,
            description: chanInfo?.description,
            privacyLevel: getPrivacyLevel(chanInfo?.channelId),
            isAdmin: channelManager.IsChannelAdmin(utils.Base64ToUint8Array(chanInfo.channelId))
          }));
          dispatch(app.actions.selectChannel(chanInfo.channelId));
        }
      } catch (error) {
        console.error('Error joining channel')
      }
    } else {
      return null;
    }
  }, [channelManager, dispatch, getPrivacyLevel, utils]);

  const getChannelInfo = useCallback((prettyPrint: string) => {
    if (utils && utils.GetChannelInfo && prettyPrint.length) {
      return channelDecoder(JSON.parse(decoder.decode(utils.GetChannelInfo(prettyPrint))));
    }
    return {};
  }, [utils]);

  const createChannel = useCallback(async (
    channelName: string,
    channelDescription: string,
    privacyLevel: PrivacyLevel.Public | PrivacyLevel.Secret,
    enableDms = true
  ) => {
      if (cmix && channelName && channelManager) {
        const channelPrettyPrint = await channelManager?.GenerateChannel(
          channelName,
          channelDescription || '',
          privacyLevel,
        );
   
        const channelInfo = getChannelInfo(channelPrettyPrint || '') as ChannelJSON;

        if (channelInfo.channelId === undefined) {
          throw new Error('ChannelID was not found');
        }
  
        const channel: Channel = {
          id: channelInfo?.channelId,
          name: channelInfo?.name,
          isAdmin: true,
          privacyLevel,
          description: channelInfo?.description,
          prettyPrint: channelPrettyPrint,
        };

        await joinChannel(channelPrettyPrint, false);
        savePrettyPrint(channel.id, channelPrettyPrint);
        dispatch(channels.actions.upsert(channel));
        dispatch(app.actions.selectChannel(channel.id));
        
        if (enableDms) {
          channelManager.EnableDirectMessages(utils.Base64ToUint8Array(channel.id));
        } else {
          channelManager.DisableDirectMessages(utils.Base64ToUint8Array(channel.id));
        }
      }
  }, [cmix, channelManager, getChannelInfo, joinChannel, dispatch, utils]);

  const shareChannel = () => {};

  const leaveCurrentChannel = useCallback(async () => {
    if (currentChannel && channelManager && channelManager.LeaveChannel && utils) {
      try {
        await channelManager.LeaveChannel(
          utils.Base64ToUint8Array(currentChannel.id)
        );
        
        dispatch(channels.actions.leaveChannel(currentChannel.id));
      } catch (error) {
        console.error('Failed to leave Channel:', error);
      }
    }
  }, [channelManager, currentChannel, dispatch, utils]);

  const sendMessage = useCallback(async (message: string, tags: string[] = []) => {
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
          MESSAGE_LEASE,
          new Uint8Array(),
          encoder.encode(JSON.stringify(tags)),
        );
      } catch (e) {
        console.error('Error sending message', e);
      }
    }

    if (dmClient && message.length && currentConversation) {
      try {
        await dmClient.SendText(
          utils.Base64ToUint8Array(currentConversation.pubkey),
          currentConversation.token,
          message,
          MESSAGE_LEASE,
          new Uint8Array()
        )
      } catch (e) {
        console.error('Error sending dm', e);
      }
    }
  }, [channelManager, currentChannel, currentConversation, dmClient, utils]);

  const sendReply = useCallback(async (reply: string, replyToMessageId: string, tags: string[] = []) => {
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
          new Uint8Array(),
          encoder.encode(JSON.stringify(tags))
        );
      } catch (error) {
        console.error(`Test failed to reply to messageId ${replyToMessageId}`);
      }
    }

    if (reply.length && dmClient && currentConversation) {
      try {
        await dmClient.SendReply(
          utils.Base64ToUint8Array(currentConversation.pubkey),
          currentConversation.token,
          reply,
          utils.Base64ToUint8Array(replyToMessageId),
          30000,
          new Uint8Array()
        );
      } catch (error) {
        console.error(`Test failed to reply to messageId ${replyToMessageId}`);
      }
    }
  }, [channelManager, currentChannel, currentConversation, dmClient, utils]);

  const deleteMessage = useCallback(async ({ channelId, id }: Pick<Message, 'channelId' | 'id'>) => {
    await channelManager?.DeleteMessage(
      utils.Base64ToUint8Array(channelId),
      utils.Base64ToUint8Array(id),
      utils.GetDefaultCMixParams()
    );

    dispatch(messages.actions.delete(id));
  }, [channelManager, dispatch, utils]);

  const sendReaction = useCallback(async (reaction: string, reactToMessageId: string) => {
    if (channelManager && utils && utils.Base64ToUint8Array && currentChannel) {
      try {
        await channelManager.SendReaction(
          utils.Base64ToUint8Array(currentChannel.id),
          reaction,
          utils.Base64ToUint8Array(reactToMessageId),
          utils.ValidForever(),
          new Uint8Array()
        );
      } catch (error) {
        console.error(
          `Test failed to react to messageId ${reactToMessageId}`,
          error
        );
      }
    }

    if (dmClient && currentConversationId !== null && currentConversation?.token !== undefined) {
      try {
        await dmClient.SendReaction(
          utils.Base64ToUint8Array(currentConversationId),
          currentConversation.token,
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
  }, [
    currentConversationId,
    currentConversation?.token,
    dmClient,
    channelManager,
    currentChannel,
    utils
  ]);

  const setNickname = useCallback((nickName: string) => {
    if (channelManager?.SetNickname && currentChannel?.id) {
      try {
        channelManager?.SetNickname(
          nickName,
          utils.Base64ToUint8Array(currentChannel?.id)
        );
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    }

    if (dmClient && currentConversation) {
      try {
        dmClient.SetNickname(nickName);
        dispatch(dms.actions.setUserNickname(nickName));
        return true;
      } catch (e) {
        console.error('Error setting DM nickname', e);
        return false;
      }
    }
    return false;
  }, [
    channelManager,
    currentChannel?.id,
    currentConversation,
    dispatch,
    dmClient,
    utils
  ]);

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

    if (currentConversation && dmClient) {
      try {
        nickName = dmClient?.GetNickname();
      } catch (error) {
        nickName = '';
      }
    }
    return nickName;
  }, [channelManager, currentChannel, currentConversation, dmClient, utils]);

  useEffect(() => {
    if (currentChannel) {
      dispatch(channels.actions.updateNickname({
        channelId: currentChannel.id,
        nickname: getNickName()
      }))
    } else if (currentConversation) {
      dispatch(dms.actions.setUserNickname(getNickName()));
    }
  }, [currentChannel, currentConversation, dispatch, getNickName]);

  // Identity object is combination of private identity and code name
  const generateIdentities = useCallback((amountOfIdentities: number) => {
    const identitiesObjects: ReturnType<NetworkContext['generateIdentities']> = [];
    if (utils && utils.GenerateChannelIdentity && cmix) {
      for (let i = 0; i < amountOfIdentities; i++) {
        const createdPrivateIdentity = utils.GenerateChannelIdentity(cmix?.GetID());
        const publicIdentity = utils.GetPublicChannelIdentityFromPrivate(
          createdPrivateIdentity
        );
        const identityJson = identityDecoder(JSON.parse(decoder.decode(publicIdentity)));
        const codename = identityJson.codename;
        identitiesObjects.push({
          privateIdentity: createdPrivateIdentity,
          codename,
          codeset: identityJson.codeset,
          pubkey: identityJson.pubkey
        });
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
    onIsReadyInfoChange: (readinessInfo: IsReadyInfoJSON) => void
  ) => {
    return new Promise<void>((resolve) => {
      const intervalId = setInterval(() => {
        if (cmix) {
          const isReadyInfo = isReadyInfoDecoder(
            JSON.parse(
              decoder.decode(
                cmix?.IsReady(
                  CMIX_NETWORK_READINESS_THRESHOLD
                )
              )
            )
          );

          onIsReadyInfoChange(isReadyInfo);
          if (isReadyInfo.isReady) {
            clearInterval(intervalId);
            setTimeout(() => {
              createChannelManager(selectedPrivateIdentity);
              setIsAuthenticated(true);
              resolve();
            }, 3000);
          }
        }
      }, 1000);
    });
  }, [cmix, createChannelManager, setIsAuthenticated]);

  const logout = useCallback((password: string) => {
    if (utils && utils.Purge) {
      try {
        disconnect();
        utils.Purge(STATE_PATH, password);
        window.localStorage.clear();
        Cookies.remove('userAuthenticated', { path: '/' });
        setIsAuthenticated(false);
        setChannelManager(undefined);
        window.location.reload();
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    } else {
      return false;
    }
  }, [disconnect, setIsAuthenticated, utils]);

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

  useEffect(() => {
    getMutedUsers();
  }, [currentChannel, getMutedUsers]);

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

  useEffect(() => {
    if (utils && utils.GetWasmSemanticVersion) {
      const version = versionDecoder(JSON.parse(decoder.decode(utils.GetWasmSemanticVersion())));
      const isUpdate = version.updated;
      const outdatedVersion = '0.1.8';
      const [outdatedMajor, outdatedMinor] = outdatedVersion.split('.').map((i) => parseInt(i, 10));
      const [oldMajor, oldMinor] = version.old.split('.').map((i) => parseInt(i, 10));

      if (isUpdate && oldMinor <= outdatedMinor && oldMajor === outdatedMajor) {
        window.localStorage.clear();
        Cookies.remove('userAuthenticated', { path: '/' });
        window.location.reload();
      }
    }
          
  }, [utils]);

  const ctx: NetworkContext = {
    decryptMessageContent: cipher?.decrypt,
    channelManager,
    dmClient,
    getMutedUsers,
    mutedUsers,
    exportChannelAdminKeys,
    importChannelAdminKeys,
    setMutedUsers: setMutedUsers,
    muteUser,
    cmix,
    networkStatus: cmixStatus,
    pagination,
    deleteMessage,
    joinChannel,
    createChannel,
    shareChannel,
    sendMessage,
    leaveCurrentChannel,
    generateIdentities: generateIdentities,
    createChannelManager,
    loadChannelManager,
    handleInitialLoadData: fetchInitialData,
    setNickname: setNickname,
    getNickName,
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
    isNetworkHealthy: cmixStatus === NetworkStatus.CONNECTED,
    checkRegistrationReadiness,
    pinMessage,
    logout,
    upgradeAdmin,
    remoteStore,
    fetchChannels,
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
  <NetworkProvider>
    {children}
  </NetworkProvider>
);

export { NetworkStatus };