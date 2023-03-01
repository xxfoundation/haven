import type { DBConversation, DBDirectMessage, DMClient } from 'src/types';
import type { Conversation, DirectMessage } from 'src/store/dms/types';

import { useUtils, XXDKContext } from '@contexts/utils-context';
import { useEffect, useMemo, useState } from 'react';
import { MAXIMUM_PAYLOAD_BLOCK_SIZE, DMS_WORKER_JS_PATH, DMS_STORAGE_TAG as DMS_DATABASE_NAME } from 'src/constants';
import { decoder } from '@utils/index';
import { onDmReceived, DMReceivedEvent, Event, bus } from 'src/events';
import { useDb } from '@contexts/db-context';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import * as dms from 'src/store/dms';
import * as app from 'src/store/app';
import * as identity from 'src/store/identity';
import useLocalStorage from './useLocalStorage';

type DatabaseCipher = {
  id: number;
  decrypt: (encrypted: string) => string;
};

const makeConversationMapper = (codenameConverter: XXDKContext['getCodeNameAndColor']) => (conversation: DBConversation): Conversation => ({
  ...codenameConverter(conversation.pub_key, conversation.codeset_version || 0),
  pubkey: conversation.pub_key,
  token: conversation.token,
  blocked: conversation.blocked,
  codeset: conversation.codeset_version || 0,
  nickname: conversation.nickname,
});

const makeMessageMapper = (codenameConverter: XXDKContext['getCodeNameAndColor'], cipher: DatabaseCipher) => (message: DBDirectMessage): DirectMessage => ({
  ...codenameConverter(message.sender_pub_key, message.codeset_version || 0),
  uuid: message.id,
  messageId: message.message_id,
  status: message.status,
  type: message.type,
  conversationId: message.conversation_pub_key,
  parentMessageId: message.parent_message_id === 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=' ? null : message.parent_message_id,
  timestamp: message.timestamp,
  body: cipher.decrypt(message.text),
  round: message.round,
  pubkey: message.sender_pub_key,
  codeset: message.codeset_version || 0,
})

const useDmClient = (
  cmixId?: number,
  privateIdentity?: Uint8Array,
  decryptedInternalPassword?: Uint8Array
) => {
  const dmsDb = useDb('dm');
  const dispatch = useAppDispatch();
  const currentConversationId = useAppSelector(app.selectors.currentConversationId);
  const [client, setClient] = useState<DMClient | undefined>();
  const [databaseCipher, setDatabaseCipher] = useState<DatabaseCipher>();
  const { getCodeNameAndColor, utils } = useUtils();
  const { NewDMClientWithIndexedDb } = utils;
  const [dmsDatabaseName, setDmsDatabaseName] = useLocalStorage<string | null>(DMS_DATABASE_NAME, null);
  const conversationMapper = useMemo(() => getCodeNameAndColor && makeConversationMapper(getCodeNameAndColor), [getCodeNameAndColor])
  const messageMapper = useMemo(
    () => databaseCipher && getCodeNameAndColor && makeMessageMapper(
      getCodeNameAndColor,
      databaseCipher
    ),
    [databaseCipher, getCodeNameAndColor]
  );
  const userIdentity = useAppSelector(identity.selectors.identity);

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
  }, [conversationMapper, dispatch, dmsDb]);

  useEffect(() => {
    if (dmsDb && messageMapper && currentConversationId !== null) {
      dmsDb.table<DBDirectMessage>('messages')
        // Index is missing for this.
        // .where('conversation_pub_key')
        // .equals(currentConversationId)
        .filter((m) => m.conversation_pub_key === currentConversationId)
        .toArray()
        .then((messages) => {
          
          dispatch(dms.actions.upsertManyDirectMessages(messages.map(messageMapper)))
        })
    }
  }, [currentConversationId, dispatch, dmsDb, messageMapper])

  useEffect(() => {
    if (!dmsDb || !messageMapper || !conversationMapper) {
      return;
    }

    const listener = (e: DMReceivedEvent) => {
      console.log('DM_RECEIVED', e);
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
          if (!conversation || !message) {
            console.error('Couldn\'t find conversation or message in database.');
            return;
          }

          dispatch(
            dms.actions.upsertConversation(
              conversationMapper(conversation)
            )
          );

          if (currentConversationId !== conversation.pub_key && pubkey !== userIdentity?.pubkey) {
            dispatch(dms.actions.notifyNewMessage(conversation.pub_key));
          }

          dispatch(dms.actions.upsertDirectMessage(messageMapper(message)));
      });
    }

    bus.addListener(Event.DM_RECEIVED, listener);

    return () => { bus.removeListener(Event.DM_RECEIVED, listener) };
  }, [
    conversationMapper,
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
