import { DBChannel, DBConversation, DBDirectMessage, DBMessage } from 'src/types';
import { useDb } from '@contexts/db-context';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { contrastColor as getContrastColor } from 'contrast-color';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import s from './UserInfoDrawer.module.scss';
import { byTimestamp } from 'src/store/utils';
import { Close, Elixxir } from '@components/icons';
import * as app from 'src/store/app';
import * as dms from 'src/store/dms';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { useOnClickOutside } from 'usehooks-ts';
import Envelope from '@components/icons/Envelope';
import Slash from '@components/icons/Slash';
import { useUtils } from '@contexts/utils-context';

const calculateContrastColor = (color?: string) => getContrastColor({
  bgColor: color ?? '#000',
  fgLightColor: 'var(--text-primary)'
});

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

const UserInfoDrawer = () => {
  const { t } = useTranslation();
  const db = useDb();
  const dmDb = useDb('dm');
  const { getCodeNameAndColor } = useUtils();
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    selectedChannelIdOrConversationId,
    selectedUserPubkey
  } = useAppSelector((state) => state.app);
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const contrastColor = useMemo(
    () => calculateContrastColor(userInfo?.color),
    [userInfo?.color]
  );
  const [commonChannels, setCommonChannels] = useState<CommonChannel[]>();
  const [drawerState, setDrawerState] = useState<'open' | 'closed'>('closed');
  const existingConversation = useAppSelector(dms.selectors.currentConversation);
  
  const closeDrawer = useCallback(() => {
    if (drawerState === 'open') {
      setDrawerState('closed');
      dispatch(app.actions.selectUser(null));
    }
  }, [dispatch, drawerState]);

  const selectDm = useCallback(() => {
    if (userInfo && userInfo.dmToken) {
      if (!existingConversation) {
        dispatch(dms.actions.upsertConversation({
          pubkey: userInfo.pubkey,
          token: userInfo.dmToken,
          codeset: userInfo.codeset,
          codename: userInfo.codename,
          color: userInfo.color,
          blocked: false,
        }));
      }

      dispatch(app.actions.selectChannel(userInfo.pubkey));
      closeDrawer();
    }
  }, [dispatch, existingConversation, userInfo, closeDrawer])

  
  useOnClickOutside(containerRef, closeDrawer);

  useEffect(() => {
    if (!db || selectedUserPubkey === null) {
      return;
    }

    setCommonChannels([]);

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
          setDrawerState('open');
            
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
          dmToken: conversation.token,
          pubkey: conversation.pub_key,
          nickname: conversation.nickname
        });
        setDrawerState('open');
      }
    })
  }, [
    closeDrawer,
    db,
    dmDb,
    getCodeNameAndColor,
    selectedChannelIdOrConversationId,
    selectedUserPubkey
  ]);

  const offsetHeight = containerRef.current ? `-${containerRef.current?.offsetHeight}px` : '-100%';
  return (
    <div
      ref={containerRef}
      className={cn(s.drawer)}
      style={{ bottom: drawerState === 'closed' ? offsetHeight : 0}}>
      <div className={s.header} style={{ backgroundColor: `${userInfo?.color}` }}>
        <Close onClick={closeDrawer} color={contrastColor} className={s.closeIcon} />
        <span style={{ color: contrastColor, opacity: 1 }}>
          {userInfo?.nickname && userInfo.nickname}
          &nbsp;&nbsp;<Elixxir style={{ display: 'inline' }} fill={contrastColor} />
          {userInfo?.codename}
        </span>
      </div>
      <div className={s.content}>
        <h5>
          {userInfo?.dmToken ? (
            <button onClick={selectDm} className={s.option}>
              <Envelope
                className={cn(s.actionIcon, 'mr-3 cursor-pointer')}
                size='sm' color='var(--orange)' />
              {t('Direct Message')}
            </button>
          ) : (
            <span className={s.option}>
              <span className={cn(s.combinedIcons, 'fa-2x mr-3')}>
                <Slash
                  className={s.slash}
                  color='var(--red)'
                  width='1.5rem'
                />
                <Envelope
                  color='white'
                  width='1.5rem'
                />
              </span>
              <span>
                {t('User has not enabled direct messages.')}
              </span>
            </span>
          )}
        </h5>
      </div>
      {commonChannels && commonChannels.length > 0 && (
        <div className={s.spaces}>
          <div className={cn(s.divider, 'inline-flex items-center justify-center w-full')}>
            <hr className='w-full' />
            <span className={cn(s.textMuted, 'px-3 text-xs whitespace-nowrap uppercase')}>
              {t('Spaces in common')}
            </span>
            <hr className='w-full' />
          </div>
          <div className='flex justify-between mb-2'>
            <span className={cn(s.textMuted, 'text-xs whitespace-nowrap uppercase')}>
              {t('Space name')}
            </span>
            <span className={cn(s.textMuted, 'text-xs whitespace-nowrap uppercase')}>
              {t('Also known as')}
            </span>
          </div>
          <ul style={{ maxHeight: 186, overflow: 'auto'}}>
            {commonChannels?.map((c) => (
              <React.Fragment key={c.id}>
                <li className='py-2 border-indigo-500 text-sm'>
                  <span
                    className='font-medium w-1/2 inline-block pr-1 text-ellipsis overflow-hidden whitespace-nowrap'>
                    {c.channelName}
                  </span>
                  <span
                    title={c.nickname || c.codename}
                    className={cn(s.textMuted, 'w-1/2 inline-block text-right pl-1 text-ellipsis  overflow-hidden whitespace-nowrap')}>
                    {c.nickname || <><Elixxir style={{ display: 'inline' }} fill='var(--text-muted)' /> {c.codename}</>}
                  </span>
                </li>
                <hr className='mb-1' />
              </React.Fragment>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default UserInfoDrawer;
