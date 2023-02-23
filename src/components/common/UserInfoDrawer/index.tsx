import { DBConversation, DBDirectMessage, DBMessage } from 'src/types';
import { useDb } from '@contexts/db-context';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { contrastColor as getContrastColor } from 'contrast-color';

import s from './UserInfoDrawer.module.scss';
import { useNetworkClient } from '@contexts/network-client-context';
import { byTimestamp } from 'src/store/utils';
import { Elixxir } from '@components/icons';
import { useAppSelector } from 'src/store/hooks';

const calculateContrastColor = (color?: string) => getContrastColor({
  bgColor: color ?? '#000',
  fgLightColor: 'var(--text-primary)'
});

type UserInfo = {
  codeset: number,
  codename: string,
  color: string,
  nickname?: string,
  pubkey: string
};

const UserInfoDrawer = () => {
  const db = useDb();
  const dmDb = useDb('dm');
  const { getCodeNameAndColor } = useNetworkClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    selectedChannelId,
    selectedConversationId,
    selectedUserPubkey
  } = useAppSelector((state) => state.app);
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const contrastColor = useMemo(
    () => calculateContrastColor(userInfo?.color),
    [userInfo?.color]
  );

  useEffect(() => {
    if (!db || selectedUserPubkey === null) {
      setUserInfo(undefined);
      return;
    }

    if (selectedChannelId !== null) {
      db.table<DBMessage>('messages')
        .where({ channel_id: selectedChannelId })
        .filter((msg) => msg.pubkey === selectedUserPubkey)
        .toArray()
        .then((msgs) => {
          const recentMessage = msgs.sort(byTimestamp)[msgs.length - 1];
          
          if (recentMessage) {
            const { codename, color } = getCodeNameAndColor(recentMessage.pubkey, recentMessage.codeset_version);
            setUserInfo({
              codeset: recentMessage.codeset_version,
              codename,
              nickname: recentMessage.nickname,
              color,
              pubkey: recentMessage.pubkey
            })
          }
      });
    }

    if (selectedConversationId !== null) {
      if (!dmDb) { return }
      Promise.all([
        dmDb.table<DBConversation>('conversations')
          .filter((convo) => convo.pub_key === selectedConversationId)
          .first(),
        dmDb.table<DBDirectMessage>('messages')
          .where('conversation_pub_key')
          .equals(selectedConversationId)
          .toArray()
          .then((msgs) => {
            const recentMessage: DBDirectMessage | undefined = msgs.sort(byTimestamp)[msgs.length - 1];
            
            return recentMessage;
          })
      ]).then(([conversation, recentMessage]) => {
        if (conversation && recentMessage) {
          const { codename, color } = getCodeNameAndColor(conversation.pub_key, conversation.codeset_version);
          setUserInfo({
            codeset: conversation?.codeset_version,
            codename,
            color,
            pubkey: conversation.pub_key,
            nickname: conversation.pub_key
          });
        }
      })
    }
  }, [
    db,
    dmDb,
    getCodeNameAndColor,
    selectedChannelId,
    selectedConversationId,
    selectedUserPubkey
  ]);

  return userInfo ? (
    <div ref={containerRef} className={s.drawer}>
      <div className={s.header} style={{ backgroundColor: `${userInfo?.color}` }}>
        <span style={{ color: contrastColor, opacity: 1 }}>
          {userInfo?.nickname && userInfo.nickname}
          {' '}<Elixxir style={{ display: 'inline' }} fill={contrastColor} />
          {userInfo?.codename}
        </span>
      </div>
      <div className={s.content}>
        I HAVE MORE STUFF HERE.
      </div>
    </div>
  ) : null;
}

export default UserInfoDrawer;
