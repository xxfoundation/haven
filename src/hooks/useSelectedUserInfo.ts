import type { DBChannel, DBConversation, DBDirectMessage, DBMessage } from 'src/types';

import { useEffect, useState } from 'react';

import { useDb } from '@contexts/db-context';
import { useAppSelector } from 'src/store/hooks';
import { byTimestamp } from 'src/store/utils';
import { useUtils } from '@contexts/utils-context';
import { dmTokens as dmTokensSelector } from 'src/store/messages/selectors';

type UserInfo = {
  codeset: number,
  codename: string,
  dmToken?: number;
  color: string,
  nickname?: string,
  pubkey: string
};

type CommonChannel = {
  id: string;
  nickname?: string;
  codename: string;
  channelName: string;
}

const useSelectedUserInfo = () => {
  const { getCodeNameAndColor } = useUtils();
  const db = useDb();
  const dmDb = useDb('dm');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [commonChannels, setCommonChannels] = useState<CommonChannel[]>();
  const { selectedUserPubkey } = useAppSelector((state) => state.app);
  const dmTokens = useAppSelector(dmTokensSelector);

  useEffect(() => {
    setUserInfo(null);
    setCommonChannels([]);
    
    if (!db || selectedUserPubkey === null) {
      return;
    }


    db.table<DBMessage>('messages')
      .filter((msg) => msg.pubkey === selectedUserPubkey)
      .toArray()
      .then((msgs) => {
        const sortedMessages = msgs.sort(byTimestamp);
        const recentMessage = sortedMessages[msgs.length - 1];
        
        if (recentMessage) {
          const { codename, color } = getCodeNameAndColor(recentMessage.pubkey, recentMessage.codeset_version);
          setUserInfo({
            codeset: recentMessage.codeset_version,
            codename,
            dmToken: recentMessage.dm_token === 0 ? undefined : recentMessage.dm_token,
            nickname: recentMessage.nickname,
            color,
            pubkey: recentMessage.pubkey
          });
            
          const latestMessageByChannelId = sortedMessages.reverse().reduce((acc, cur) => ({
            ...acc,
            [cur.channel_id]: acc[cur.channel_id] || cur,
          }), {} as Record<string, DBMessage>);

          const channelIds = Object.keys(latestMessageByChannelId);

          db.table<DBChannel>('channels')
            .where('id')
            .anyOf(channelIds)
            .toArray()
            .then((channels) => {
              setCommonChannels(
                channels.map((c) => ({
                  id: c.id,
                  channelName: c.name,
                  nickname: latestMessageByChannelId[c.id]?.nickname,
                  codename: codename
                }))
              )
            });
        }
    });

    if (!dmDb) { return }
    Promise.all([
      dmDb.table<DBConversation>('conversations')
        .filter((convo) => convo.pub_key === selectedUserPubkey)
        .first(),
      dmDb.table<DBDirectMessage>('messages')
        .filter((msg) => msg.sender_pub_key === selectedUserPubkey)
        .last()
    ]).then(([conversation, recentMessage]) => {
      if (conversation && recentMessage) {
        const { codename, color } = getCodeNameAndColor(conversation.pub_key, conversation.codeset_version);
        setUserInfo({
          codeset: conversation?.codeset_version,
          codename,
          color,
          dmToken: dmTokens[conversation.pub_key],
          pubkey: conversation.pub_key,
          nickname: conversation.nickname
        });
      }
    })
  }, [
    db,
    dmDb,
    getCodeNameAndColor,
    selectedUserPubkey,
    dmTokens
  ]);


  return userInfo && {
    info: userInfo,
    commonChannels,
  }
}

export default useSelectedUserInfo;
