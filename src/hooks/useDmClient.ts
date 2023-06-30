import type { CMix, DBConversation, DBDirectMessage, DMClient, DMReceivedEvent, Identity, Message } from 'src/types';
import type { Conversation } from 'src/store/dms/types';

import { useCallback, useEffect, useMemo, useState } from 'react';
import assert from 'assert';

import { useUtils, XXDKContext } from '@contexts/utils-context';
import { MAXIMUM_PAYLOAD_BLOCK_SIZE, DMS_WORKER_JS_PATH, DMS_DATABASE_NAME as DMS_DATABASE_NAME } from 'src/constants';
import { decoder } from '@utils/index';
import { AppEvents, awaitAppEvent, DMEvents, useAppEventListener, useDmListener } from 'src/events';
import { useDb } from '@contexts/db-context';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import * as dms from 'src/store/dms';
import * as app from 'src/store/app';
import * as identity from 'src/store/identity';
import useLocalStorage from './useLocalStorage';
import useNotification from './useNotification';
import { onDmEvent } from 'src/events';

type DatabaseCipher = {
  id: number;
  decrypt: (encrypted: string) => string;
};

const makeConversationMapper = (
  codenameConverter?: XXDKContext['getCodeNameAndColor']
) => (conversation: DBConversation): Conversation => ({
  codename: '',
  color: 'var(--text-primary)',
  ...(codenameConverter && codenameConverter(conversation.pub_key, conversation.codeset_version || 0)),
  pubkey: conversation.pub_key,
  token: conversation.token,
  blocked: conversation.blocked,
  codeset: conversation.codeset_version,
  nickname: conversation.nickname,
});

const makeMessageMapper = (
  codenameConverter: XXDKContext['getCodeNameAndColor'],
  cipher: DatabaseCipher,
  userIdentity: Identity,
  nickname?: string
) => (message: DBDirectMessage, conversation: Conversation): Message => ({
  nickname:  message.sender_pub_key === userIdentity?.pubkey ? nickname : conversation?.nickname,
  ...codenameConverter(message.sender_pub_key, message.codeset_version),
  uuid: message.id,
  id: message.message_id,
  status: message.status,
  type: message.type,
  channelId: message.conversation_pub_key,
  repliedTo: message.parent_message_id === 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=' ? null : message.parent_message_id,
  timestamp: message.timestamp,
  body: cipher.decrypt(message.text),
  round: message.round,
  pubkey: message.sender_pub_key,
  codeset: message.codeset_version,
  pinned: false,
  hidden: false
})

const useDmClient = () => {
  const { dmReceived } = useNotification();
  const dmsDb = useDb('dm');
  const dispatch = useAppDispatch();
  const dmNickname = useAppSelector(dms.selectors.dmNickname);
  const currentConversation = useAppSelector(dms.selectors.currentConversation);
  const currentConversationId = useAppSelector(app.selectors.currentChannelOrConversationId);
  const allDms = useAppSelector((state) => state.dms.messagesByPubkey)
  const [client, setClient] = useState<DMClient | undefined>();
  const [databaseCipher, setDatabaseCipher] = useState<DatabaseCipher>();
  const { getCodeNameAndColor, utils } = useUtils();
  const { NewDMClientWithIndexedDb } = utils;
  const [dmsDatabaseName, setDmsDatabaseName] = useLocalStorage<string | null>(DMS_DATABASE_NAME, null);
  const conversationMapper = useMemo(() => makeConversationMapper(getCodeNameAndColor), [getCodeNameAndColor])
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
  
  const conversations = useAppSelector(dms.selectors.conversations);
  useEffect(() => {
    if (client) {
      conversations.forEach(async ({ pubkey }) => {
        const isBlocked = await client.IsBlocked(utils.Base64ToUint8Array(pubkey));
        if (isBlocked) {
          dispatch(dms.actions.blockUser(pubkey));
        } else {
          dispatch(dms.actions.unblockUser(pubkey));
        }
      })
    }
  }, [client, conversations, currentConversation, dispatch, utils])

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

  const createClient = useCallback((cmix: CMix, cipher: DatabaseCipher, privateIdentity: Uint8Array) => {
    assert(privateIdentity, 'Private identity required for dmClient');
    
    try {
      const notifications = utils.LoadNotificationsDummy(cmix.GetID());
      NewDMClientWithIndexedDb(
        cmix.GetID(),
        notifications.GetID(),
        cipher.id,
        DMS_WORKER_JS_PATH,
        privateIdentity,
        { EventUpdate: onDmEvent }
      ).then(setClient);
    } catch (e) {
      console.error('Failed to create DM client:', e);
    }
  }, [NewDMClientWithIndexedDb, utils]);

  const onPasswordDecryption = useCallback(async (password: Uint8Array, rawPassword: string) => {
    const events = await Promise.all([
      awaitAppEvent(AppEvents.CMIX_LOADED, undefined, 1000000000),
      awaitAppEvent(AppEvents.CHANNEL_MANAGER_LOADED, undefined, 1000000000)
    ]);
    const cmix = events[0]?.[0];
    const channelManager = events[1]?.[0];
    assert(cmix, 'Cmix required for dm client');
    assert(channelManager, 'Channel manager required for dm client');
    const privateIdentity = utils.ImportPrivateIdentity(rawPassword, channelManager.ExportPrivateIdentity(rawPassword));
    const cipher = createDatabaseCipher(cmix, password);
    createClient(cmix, cipher, privateIdentity);
  }, [createClient, createDatabaseCipher, utils]);

  useAppEventListener(AppEvents.PASSWORD_DECRYPTED, onPasswordDecryption);

  useEffect(() => {
    if (dmsDb && conversationMapper) {
      dmsDb.table<DBConversation>('conversations')
        .toArray()
        .then((convos) => {
          dispatch(dms.actions.upsertManyConversations(
            convos.map(conversationMapper))
          )
        })
    }
  }, [conversationMapper, dispatch, dmsDb, currentConversationId]);

  useEffect(() => {
    if (dmsDb && messageMapper && currentConversation && currentConversationId !== null) {
      dmsDb.table<DBDirectMessage>('messages')
        .where('conversation_pub_key')
        .equals(currentConversationId)
        .toArray()
        .then((messages) => {
          dispatch(dms.actions.upsertManyDirectMessages(messages.map((m) => messageMapper(m, currentConversation))))
        })
    }
  }, [currentConversation, currentConversationId, dispatch, dmsDb, messageMapper])

  const onMessageReceived = useCallback((e: DMReceivedEvent) => {
    if (!dmsDb || !messageMapper || !conversationMapper) {
      return;
    }
    const pubkey = Buffer.from(e.pubkey).toString('base64');
    Promise.all([
      dmsDb.table<DBDirectMessage>('messages')
        .where('id')
        .equals(e.uuid)
        .first(),
      dmsDb.table<DBConversation>('conversations')
        .filter((c) => c.pub_key === pubkey)
        .last()
    ]).then(([message, conversation]) => {
        if (!conversation || !message) {
          console.error('Couldn\'t find conversation or message in database.');
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

        if (decryptedMessage.pubkey !== userIdentity?.pubkey && currentConversationId !== conversation.pub_key) {
          dmReceived(decryptedMessage.nickname || decryptedMessage.codename, decryptedMessage.body);
        }
    });
  }, [allDms, conversationMapper, currentConversationId, dispatch, dmReceived, dmsDb, messageMapper, userIdentity?.pubkey])
  
  useDmListener(DMEvents.DM_MESSAGE_RECEIVED, onMessageReceived);

  return client;
}

export default useDmClient;
