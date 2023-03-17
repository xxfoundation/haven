import type { DBConversation, DBDirectMessage, DMClient, Identity, Message } from 'src/types';
import type { Conversation } from 'src/store/dms/types';

import { useUtils, XXDKContext } from '@contexts/utils-context';
import { useEffect, useMemo, useState } from 'react';
import { MAXIMUM_PAYLOAD_BLOCK_SIZE, DMS_WORKER_JS_PATH, DMS_DATABASE_NAME as DMS_DATABASE_NAME } from 'src/constants';
import { decoder } from '@utils/index';
import { onDmReceived, DMReceivedEvent, Event, bus } from 'src/events';
import { useDb } from '@contexts/db-context';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import * as dms from 'src/store/dms';
import * as app from 'src/store/app';
import * as identity from 'src/store/identity';
import useLocalStorage from './useLocalStorage';
import useNotification from './useNotification';

type DatabaseCipher = {
  id: number;
  decrypt: (encrypted: string) => string;
};

const makeConversationMapper = (
  codenameConverter: XXDKContext['getCodeNameAndColor']
) => (conversation: DBConversation): Conversation => ({
  ...codenameConverter(conversation.pub_key, conversation.codeset_version || 0),
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

const useDmClient = (
  cmixId?: number,
  privateIdentity?: Uint8Array,
  decryptedInternalPassword?: Uint8Array
) => {
  const { dmReceived } = useNotification();
  const dmsDb = useDb('dm');
  const dispatch = useAppDispatch();
  const dmNickname = useAppSelector(dms.selectors.dmNickname);
  const currentConversation = useAppSelector(dms.selectors.currentConversation);
  const currentConversationId = useAppSelector(app.selectors.currentConversationId);
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

  useEffect(() => {
    if (cmixId !== undefined && decryptedInternalPassword) {
      const cipher = utils.NewDMsDatabaseCipher(
        cmixId,
        decryptedInternalPassword,
        MAXIMUM_PAYLOAD_BLOCK_SIZE
      );
  
      setDatabaseCipher({
        id: cipher.GetID(),
        decrypt: (encrypted: string) => decoder.decode(
          cipher.Decrypt(utils.Base64ToUint8Array(encrypted))
        ),
      })
    }
  }, [cmixId, decryptedInternalPassword, utils]);

  useEffect(() => {
    if (!databaseCipher || cmixId === undefined || !privateIdentity || client) { return; }
    try {
      NewDMClientWithIndexedDb(
        cmixId,
        DMS_WORKER_JS_PATH,
        privateIdentity,
        onDmReceived,
        databaseCipher.id
      ).then(setClient);
    } catch (e) {
      console.error('Failed to create DM client:', e);
    }
  }, [client, NewDMClientWithIndexedDb, cmixId, databaseCipher, privateIdentity])

  useEffect(() => {
    if (dmsDb && conversationMapper) {
      dmsDb.table<DBConversation>('conversations')
        .toArray()
        .then((conversations) => {
          dispatch(dms.actions.upsertManyConversations(
            conversations.map(conversationMapper))
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

  useEffect(() => {
    if (!dmsDb || !messageMapper || !conversationMapper) {
      return;
    }

    const listener = (e: DMReceivedEvent) => {
      const pubkey = Buffer.from(e.pubkey).toString('base64');
      Promise.all([
        dmsDb.table<DBDirectMessage>('messages')
          .where('id')
          .equals(e.messageUuid)
          .first(),
        dmsDb.table<DBConversation>('conversations')
          .filter((c) => c.pub_key === pubkey)
          .last()
      ]).then(([message, conversation]) => {
          // console.log('DM_RECEIVED', message);
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

          if (
            currentConversationId !== conversation.pub_key
            && message.sender_pub_key !== userIdentity?.pubkey
            && messageIsNew
          ) {
            dispatch(dms.actions.notifyNewMessage(conversation.pub_key));
          }

          const decryptedMessage = messageMapper(message, mappedConversation);

          dispatch(dms.actions.upsertDirectMessage(decryptedMessage));

          if (decryptedMessage.pubkey !== userIdentity?.pubkey && currentConversationId !== conversation.pub_key) {
            dmReceived(decryptedMessage.nickname || decryptedMessage.codename, decryptedMessage.body);
          }
      });
    }

    bus.addListener(Event.DM_RECEIVED, listener);

    return () => { bus.removeListener(Event.DM_RECEIVED, listener) };
  }, [
    allDms,
    conversationMapper,
    dmReceived,
    userIdentity,
    messageMapper,
    currentConversationId,
    dispatch,
    dmsDb,
    getCodeNameAndColor
  ]);

  return client;
}

export default useDmClient;
