import { contrastColor as getContrastColor } from 'contrast-color';
import React, { useCallback, useMemo } from 'react';

import useSelectedUserInfo from 'src/hooks/useSelectedUserInfo';
import { Elixxir } from '@components/icons';
import Envelope from 'src/components/icons/Envelope';
import Close from 'src/components/icons/X';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import * as app from 'src/store/app';
import * as dms from 'src/store/dms';
import * as identity from 'src/store/identity';
import { useTranslation } from 'react-i18next';
import { useUI } from '@contexts/ui-context';
import Block from '@components/icons/Block';
import { useUtils } from '@contexts/utils-context';
import { useNetworkClient } from '@contexts/network-client-context';
import useAsync from 'src/hooks/useAsync';
import Spinner from '../Spinner/Spinner';


const calculateContrastColor = (color?: string) => getContrastColor({
  bgColor: color ?? '#000',
  fgLightColor: 'var(--text-primary)'
});

const UserDetails = () => {
  const { utils } = useUtils();
  const { dmClient } = useNetworkClient();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const details = useSelectedUserInfo();
  const userInfo = details?.info;
  const commonChannels = details?.commonChannels;
  const conversations = useAppSelector(dms.selectors.conversationsByPubkey);
  const isBlocked = useAppSelector(dms.selectors.isBlocked(userInfo?.pubkey ?? ''));
  const { setLeftSidebarView } = useUI();

  const isSelf = useAppSelector(identity.selectors.identity)?.pubkey === userInfo?.pubkey;

  const onClose = useCallback(() => {
    dispatch(app.actions.selectUser(null));
  }, [dispatch]);

  const contrastColor = useMemo(
    () => calculateContrastColor(userInfo?.color),
    [userInfo?.color]
  );

  const selectDm = useCallback(() => {
    if (userInfo && userInfo.dmToken) {
      const existingConversation = conversations[userInfo.pubkey];
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

      setLeftSidebarView('dms');
      dispatch(app.actions.selectChannelOrConversation(userInfo.pubkey));
      onClose();
    }
  }, [userInfo, conversations, setLeftSidebarView, dispatch, onClose]);

  const selectChannel = useCallback((id: string) => {
    setLeftSidebarView('spaces');
    dispatch(app.actions.selectChannelOrConversation(id));
  }, [dispatch, setLeftSidebarView]);


  const blockUser = useCallback(async (pubkey: string) => {
    const encodedKey = utils.Base64ToUint8Array(pubkey);
    await dmClient?.BlockPartner(encodedKey);
    const blocked = await dmClient?.IsBlocked(encodedKey);

    if (blocked) {
      dispatch(dms.actions.blockUser(pubkey));
    }
  }, [dispatch, dmClient, utils]);

  const unblockUser = useCallback(async (pubkey: string) => {
    const encodedKey = utils.Base64ToUint8Array(pubkey);
    await dmClient?.UnblockPartner(encodedKey);
    const blocked = await dmClient?.IsBlocked(encodedKey);
    if (!blocked) {
      dispatch(dms.actions.unblockUser(pubkey));
    }
  }, [dispatch, dmClient, utils]);  

  const toggleBlock = useCallback(async () => {
    const pubkey = userInfo?.pubkey ?? '';
    return isBlocked ? unblockUser(pubkey) : blockUser(pubkey);
  }, [blockUser, isBlocked, unblockUser, userInfo?.pubkey]);

  const toggleBlockAsync = useAsync(toggleBlock);

  return details && (
    <div className='min-w-[22rem] max-w-[22rem] flex flex-col '>
      <div className='px-6 py-4 flex flex-nowrap justify-between'  style={{ backgroundColor: `${userInfo?.color}` }}>
        <span className='whitespace-nowrap' style={{ color: contrastColor }}>
          {userInfo?.nickname && userInfo.nickname}
          &nbsp;&nbsp;<Elixxir className='inline' fill={contrastColor} />
          &nbsp;
          {userInfo?.codename}
        </span>
        <button className='hover:bg-charcoal-3-20 rounded-full' onClick={onClose}>
          <Close className='w-5 h-5' color={contrastColor} />
        </button>
      </div>
      <div className='px-2 py-8'>
        {userInfo?.dmToken && (
          <button className='w-full flex space-x-4 text-lg items-center group hover:text-primary hover:bg-charcoal-3-20 rounded-xl py-4 px-6' onClick={selectDm}>
            <Envelope className='w-6 h-6 text-charcoal-1 group-hover:text-primary' />
            <span>{t('Direct Message')}</span>
          </button>
        )}
        {!isSelf && (
          <button
            disabled={toggleBlockAsync.status === 'pending'}
            onClick={toggleBlockAsync.execute}
            className='w-full flex space-x-4 text-lg items-center group hover:text-primary hover:bg-charcoal-3-20 rounded-xl py-4 px-6'>
            {toggleBlockAsync.status === 'pending' ? (
              <Spinner size='sm' />
            ) : (
              <>
                <Block className='w-6 h-6 text-charcoal-1 group-hover:text-primary' />
                <span>{isBlocked ? t('Unblock') : t('Block')}</span>
              </>
            )}
          </button>
        )}
      </div>
      {commonChannels && commonChannels.length > 0 && (
        <>
          <h6 className='px-6 text-sm mb-5 whitespace-nowrap uppercase tracking-wide font-normal leading-normal'>
            {t('Spaces in common')}
          </h6>
          <div className='flex-grow overflow-y-auto'>
            <div>
              {commonChannels?.map((c) => (
                <React.Fragment key={c.id}>
                  <button
                    onClick={() => selectChannel(c.id)}
                    className='px-6 py-3 hover:bg-charcoal-3-20 text-left w-full'>
                    <span className='font-semibold'>
                      {c.channelName}
                    </span>
                    <br />
                    <span
                      title={c.nickname || c.codename}
                      className='text-charcoal-1'>
                      {c.nickname || <><Elixxir style={{ display: 'inline' }} fill='var(--text-muted)' /> {c.codename}</>}
                    </span>
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
};

export default UserDetails;
