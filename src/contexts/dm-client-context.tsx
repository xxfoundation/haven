import { MessageStatus, type CMix, type DBConversation, type DBDirectMessage, type DMClient, type DMReceivedEvent, type Identity, type Message, WithChildren, DatabaseCipher, MessageType } from 'src/types';
import type { Conversation } from 'src/store/dms/types';

import { FC, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import assert from 'assert';

import { useUtils, XXDKContext } from '@contexts/utils-context';
import { MAXIMUM_PAYLOAD_BLOCK_SIZE, DMS_DATABASE_NAME as DMS_DATABASE_NAME } from 'src/constants';
import { decoder, HTMLToPlaintext, inflate } from '@utils/index';
import { AppEvents, DMEvents, useAppEventValue, useDmListener } from 'src/events';
import { useDb } from '@contexts/db-context';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import * as messages from 'src/store/messages';
import * as dms from 'src/store/dms';
import * as app from 'src/store/app';
import * as identity from 'src/store/identity';
import useLocalStorage from 'src/hooks/useLocalStorage';
import { onDmEvent, appBus as bus } from 'src/events';

import { dmIndexedDbWorkerPath, setXXDKBasePath } from 'xxdk-wasm';

const DMClientContext = createContext<{ cipher?: DatabaseCipher, client?: DMClient }>({});

const makeConversationMapper = (
  dmTokens: Record<string, number | undefined>,
  codenameConverter?: XXDKContext['getCodeNameAndColor'],
) => (conversation: DBConversation): Conversation => {
  // We get the dm tokens from messages because the dmToken on
  // conversations cannot be trusted.
  let token = dmTokens[conversation.pub_key];

  if (token === undefined) {
    token = conversation.token;
        // throw new Error('DM Token not found for ' + conversation.pub_key + '. Must load messages first.');
  }

  return ({
    codename: '',
    color: 'var(--text-primary)',
    ...(codenameConverter && codenameConverter(conversation.pub_key, conversation.codeset_version || 0)),
    pubkey: conversation.pub_key,
    token,
    blocked: conversation.blocked,
    codeset: conversation.codeset_version,
    nickname: conversation.nickname,
});
}

const makeMessageMapper = (
  codenameConverter: XXDKContext['getCodeNameAndColor'],
  cipher: DatabaseCipher,
  userIdentity: Identity,
  nickname?: string
) => (message: DBDirectMessage, conversation: Conversation): Message => {
  const inflated = message.type === MessageType.Reaction
    ? cipher.decrypt(message.text)
    : inflate(cipher.decrypt(message.text));
  const plaintext = HTMLToPlaintext(inflated);

  return ({
    nickname:  message.sender_pub_key === userIdentity?.pubkey ? nickname : conversation?.nickname,
    ...codenameConverter(message.sender_pub_key, message.codeset_version),
    uuid: message.id,
    id: message.message_id,
    status: message.status,
    type: message.type,
    channelId: message.conversation_pub_key,
    repliedTo: message.parent_message_id === 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=' ? null : message.parent_message_id,
    timestamp: message.timestamp,
    body: inflated,
    plaintext,
    round: message.round,
    pubkey: message.sender_pub_key,
    codeset: message.codeset_version,
    pinned: false,
    hidden: false
  })
}

export const DMContextProvider: FC<WithChildren> = ({ children }) => {
  const dmsDb = useDb('dm');
  const dispatch = useAppDispatch();
  const dmNickname = useAppSelector(dms.selectors.dmNickname);
  const conversations = useAppSelector(dms.selectors.conversations);
  const currentConversation = useAppSelector(dms.selectors.currentConversation);
  const currentConversationId = useAppSelector(app.selectors.currentChannelOrConversationId);
  const allDms = useAppSelector((state) => state.dms.messagesByPubkey);
  const [client, setClient] = useState<DMClient | undefined>();
  const [databaseCipher, setDatabaseCipher] = useState<DatabaseCipher>();
  const { getCodeNameAndColor, utils } = useUtils();
  const { NewDMClientWithIndexedDb } = utils;
  const dmTokens = useAppSelector(messages.selectors.dmTokens);
  const [dmsDatabaseName, setDmsDatabaseName] = useLocalStorage<string | null>(DMS_DATABASE_NAME, null);
  const conversationMapper = useMemo(() => makeConversationMapper(dmTokens, getCodeNameAndColor), [dmTokens, getCodeNameAndColor])
  const userIdentity = useAppSelector(identity.selectors.identity);
  const messageMapper = useMemo(
    () => databaseCipher
      && client
      && getCodeNameAndColor
      && makeMessageMapper
      && userIdentity
      && makeMessageMapper(
      getCodeNameAndColor,
      databaseCipher,
      userIdentity,
      dmNickname
    ),
    [client, databaseCipher, dmNickname, getCodeNameAndColor, userIdentity]
  );
  
  useEffect(() => {
    if (client) {
      try {
        dispatch(dms.actions.setUserNickname(client.GetNickname()));
      } catch (e) {
        // no nickname found
      }
    }
  }, [client, dispatch]);

  useEffect(() => {
    if (client && !dmsDatabaseName) {
      setDmsDatabaseName(client.GetDatabaseName());
    }
  }, [client, dmsDatabaseName, setDmsDatabaseName]);

  const createDatabaseCipher = useCallback((cmix: CMix, decryptedPassword: Uint8Array) => {
      const cipher = utils.NewDatabaseCipher(
        cmix.GetID(),
        decryptedPassword,
        MAXIMUM_PAYLOAD_BLOCK_SIZE
      );

      const dbCipher = {
        id: cipher.GetID(),
        decrypt: (encrypted: string) => decoder.decode(
          cipher.Decrypt(encrypted)
        ),
      };
  
      setDatabaseCipher(dbCipher);

      return dbCipher;
  }, [utils]);

  const createDMClient = useCallback((cmix: CMix, cipher: DatabaseCipher, privateIdentity: Uint8Array) => {
    assert(privateIdentity, 'Private identity required for dmClient');
    
    try {
      const workerPath = dmIndexedDbWorkerPath();
      console.log("DMWORKERPATH: " + workerPath);
      const notifications = utils.LoadNotificationsDummy(cmix.GetID());
      NewDMClientWithIndexedDb(
        cmix.GetID(),
        notifications.GetID(),
        cipher.id,
        workerPath.toString(),
        privateIdentity,
        { EventUpdate: onDmEvent }
      ).then(setClient);
    } catch (e) {
      console.error('Failed to create DM client:', e);
    }
  }, [NewDMClientWithIndexedDb, utils]);

  const rawPassword = useAppEventValue(AppEvents.PASSWORD_ENTERED);
  const decryptedPassword = useAppEventValue(AppEvents.PASSWORD_DECRYPTED);
  const cmix = useAppEventValue(AppEvents.CMIX_LOADED);
  const channelManager = useAppEventValue(AppEvents.CHANNEL_MANAGER_LOADED);

  useEffect(() => {
    if (rawPassword && decryptedPassword && cmix && channelManager) {
      const privateIdentity = utils.ImportPrivateIdentity(rawPassword, channelManager.ExportPrivateIdentity(rawPassword));
      const cipher = createDatabaseCipher(cmix, decryptedPassword);
      createDMClient(cmix, cipher, privateIdentity);
    }
  }, [
    channelManager,
    cmix,
    createDMClient,
    createDatabaseCipher,
    decryptedPassword,
    rawPassword,
    utils
  ])


  const messagesFetched = useAppEventValue(AppEvents.MESSAGES_FETCHED);
  useEffect(() => {
    if (dmsDb && conversationMapper && messagesFetched) {
      dmsDb.table<DBConversation>('conversations')
        .toArray()
        .then((convos) => {
          dispatch(dms.actions.upsertManyConversations(
            convos.map(conversationMapper))
          )
        })
    }
  }, [messagesFetched, conversationMapper, dispatch, dmsDb, currentConversationId]);

  useEffect(() => {
    if (dmsDb && messageMapper && conversations) {
        dmsDb.table<DBDirectMessage>('messages')
        .toArray()
        .then((directMessages) => {
          const mapped = directMessages.reduce((acc, msg) => {
            const convo = conversations.find((c) => c.pubkey === msg.conversation_pub_key);
            if (convo) {
              acc.push(messageMapper(msg, convo));
            }
            return acc;
          }, [] as Message[]);

          dispatch(dms.actions.upsertManyDirectMessages(mapped));
        })
    }
  }, [conversations, currentConversation, dispatch, dmsDb, messageMapper])

  const onMessageReceived = useCallback((e: DMReceivedEvent) => {
    if (!dmsDb || !messageMapper || !conversationMapper) {
      return;
    }

    Promise.all([
      dmsDb.table<DBDirectMessage>('messages')
        .where('id')
        .equals(e.uuid)
        .first(),
      dmsDb.table<DBConversation>('conversations')
        .filter((c) => c.pub_key === e.pubkey)
        .last()
    ]).then(([message, conversation]) => {
        if (!conversation) {
          console.error('Couldn\'t find conversation in database.');
          return;
        }

        if (!message) {
          console.error('Couldn\'t find message in database.');
          return;
        }

        const mappedConversation = conversationMapper(conversation);

        if (e.conversationUpdated) {
          dispatch(
            dms.actions.upsertConversation(
              mappedConversation
            )
          );
        }

        const messageIsNew = !allDms[message.conversation_pub_key]?.[message.id];


        const decryptedMessage = messageMapper(message, mappedConversation);

        if (
          currentConversationId !== conversation.pub_key
          && message.sender_pub_key !== userIdentity?.pubkey
          && messageIsNew
        ) {
          dispatch(app.actions.notifyNewMessage(decryptedMessage));
        }

        dispatch(dms.actions.upsertDirectMessage(decryptedMessage));
        if (messageIsNew && message.status === MessageStatus.Delivered) {
          bus.emit(AppEvents.DM_PROCESSED, decryptedMessage);
        }
    });
  }, [allDms, conversationMapper, currentConversationId, dispatch, dmsDb, messageMapper, userIdentity?.pubkey])
  
  useDmListener(DMEvents.DM_MESSAGE_RECEIVED, onMessageReceived);

  return (
    <DMClientContext.Provider value={{ client, cipher: databaseCipher }}>
      {children}
    </DMClientContext.Provider>
  );
}

export const useDmContext = () => useContext(DMClientContext);
