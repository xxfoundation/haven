import { DMNotificationLevel } from 'src/types';
import { useCallback } from 'react';
import assert from 'assert';

import {  useAppDispatch, useAppSelector } from 'src/store/hooks';
import * as dms from 'src/store/dms';
import * as app from 'src/store/app';
import { useDmContext } from '@contexts/dm-client-context';
import { useUtils } from '@contexts/utils-context';
import { MESSAGE_LEASE } from 'src/constants';
import { Conversation } from 'src/store/dms/types';

const useDmClient = () => {
  const { utils } = useUtils();
  const { client } = useDmContext();
  const dispatch = useAppDispatch();
  const conversations = useAppSelector(dms.selectors.conversations);
  const currentConversation = useAppSelector(dms.selectors.currentConversation);
  const notificationLevels = useAppSelector(dms.selectors.allNotificationLevels);

  const createConversation = useCallback((c: Omit<Conversation, 'blocked'>) => {
    const conversation = conversations.find((convo) => convo.pubkey === c.pubkey);
    if (!conversation && c.token !== undefined) {
      dispatch(dms.actions.upsertConversation({
        pubkey: c.pubkey,
        token: c.token,
        codeset: c.codeset,
        codename: c.codename,
        color: c.color ?? '#fefefe',
        blocked: false,
      }));
    }
    dispatch(app.actions.selectChannelOrConversation(c.pubkey));
  }, [conversations, dispatch]);

  const sendDirectMessage = useCallback(async (message: string) => {
    if (client && message.length && currentConversation) {
      try {
        await client.SendText(
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
  }, [client, currentConversation, utils]);

  const sendDMReply = useCallback(async (reply: string, replyToMessageId: string) => {
    if (!client || !currentConversation) {
      return;
    }
    try {
      await client?.SendReply(
        utils.Base64ToUint8Array(currentConversation.pubkey),
        currentConversation.token,
        reply,
        utils.Base64ToUint8Array(replyToMessageId),
        30000,
        new Uint8Array()
      );
    } catch (error) {
      console.error(`Failed to reply to messageId ${replyToMessageId}`);
    }
  }, [client, currentConversation, utils]);

  const sendDMReaction = useCallback(async (reaction: string, reactToMessageId: string) => {
    if (!client || !currentConversation) {
      return;
    }
    try {
      await client.SendReaction(
        utils.Base64ToUint8Array(currentConversation?.pubkey),
        currentConversation.token,
        reaction,
        utils.Base64ToUint8Array(reactToMessageId),
        new Uint8Array()
      );
    } catch (error) {
      console.error(
        `Failed to react to messageId ${reactToMessageId}`,
        error
      );
    }
  }, [client, currentConversation, utils])

  const blockUser = useCallback(async (pubkey: string) => {
    const encodedKey = utils.Base64ToUint8Array(pubkey);
    await client?.BlockPartner(encodedKey);
  }, [client, utils]);

  const unblockUser = useCallback(async (pubkey: string) => {
    const encodedKey = utils.Base64ToUint8Array(pubkey);
    await client?.UnblockPartner(encodedKey);
  }, [client, utils]);

  const blockedUsers = useAppSelector(dms.selectors.blockedUsers);

  const toggleBlocked = useCallback((pubkey: string) => {
    const isBlocked = blockedUsers.includes(pubkey);

    return isBlocked ? unblockUser(pubkey) : blockUser(pubkey);
  }, [blockUser, blockedUsers, unblockUser]);

  const setDmNickname = useCallback((nickname: string) => {
    if (!client) {
      return false;
    }

    try {
      client.SetNickname(nickname);
      dispatch(dms.actions.setUserNickname(nickname));
      return true;
    } catch (e) {
      console.error('Error setting DM nickname', e);
      return false;
    }
  }, [client, dispatch]);

  const getDmNickname = useCallback(() => {
    let nickname: string;
    try {
      nickname = client?.GetNickname() ?? '';
    } catch (error) {
      nickname = '';
    }
    return nickname;
  }, [client]);

  const toggleDmNotificationLevel = useCallback((conversationId: string) => {
    const level = notificationLevels[conversationId];
    client?.SetMobileNotificationsLevel(
      utils.Base64ToUint8Array(conversationId),
      level === DMNotificationLevel.NotifyNone
        ? DMNotificationLevel.NotifyAll
        : DMNotificationLevel.NotifyNone
    )
  }, [client, notificationLevels, utils]);

  const deleteDirectMessage = useCallback((messageId: string) => {
    assert(currentConversation, 'Current conversation is undefined');
    client?.DeleteMessage(
      utils.Base64ToUint8Array(currentConversation.pubkey),
      currentConversation.token,
      utils.Base64ToUint8Array(messageId),
      undefined,
      new Uint8Array()
    )
  }, [client, currentConversation, utils]);

  return {
    deleteDirectMessage,
    sendDirectMessage,
    createConversation,
    toggleBlocked,
    sendDMReply,
    sendDMReaction,
    setDmNickname,
    getDmNickname,
    toggleDmNotificationLevel
  };
}

export default useDmClient;
