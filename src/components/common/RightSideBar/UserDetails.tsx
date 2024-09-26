import { contrastColor as getContrastColor } from 'contrast-color';
import React, { useCallback, useMemo } from 'react';
import cn from 'classnames';

import useSelectedUserInfo from 'src/hooks/useSelectedUserInfo';
import { Elixxir, Mute } from '@components/icons';
import Envelope from 'src/components/icons/Envelope';
import Close from 'src/components/icons/X';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import * as app from 'src/store/app';
import * as dms from 'src/store/dms';
import * as identity from 'src/store/identity';
import * as channels from 'src/store/channels';
import { useTranslation } from 'react-i18next';
import { useUI } from '@contexts/ui-context';
import Block from '@components/icons/Block';
import useAsync from 'src/hooks/useAsync';
import Spinner from '../Spinner/Spinner';
import useDmClient from 'src/hooks/useDmClient';
import { useNetworkClient } from '@contexts/network-client-context';

const calculateContrastColor = (color?: string) => getContrastColor({
  bgColor: color ?? '#000',
  fgLightColor: 'var(--text-primary)'
});

const UserDetails = () => {
  const { setRightSidebarView } = useUI();
  const { createConversation, toggleBlocked } = useDmClient();
  const { muteUser } = useNetworkClient();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const details = useSelectedUserInfo();
  const userInfo = details?.info;
  const commonChannels = details?.commonChannels;
  const isBlocked = useAppSelector(dms.selectors.isBlocked(userInfo?.pubkey ?? ''));
  const { setLeftSidebarView } = useUI();
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const isMuted = useAppSelector(channels.selectors.mutedUsers)
    [currentChannel?.id ?? '']?.includes(userInfo?.pubkey ?? '');

  const isSelf = useAppSelector(identity.selectors.identity)?.pubkey === userInfo?.pubkey;

  const toggleMute = useCallback(
    () => muteUser(userInfo?.pubkey ?? '', isMuted),
    [userInfo?.pubkey, isMuted, muteUser]
  );

  const muteToggleAsync = useAsync(toggleMute);

  const onClose = useCallback(() => {
    dispatch(app.actions.selectUser(null));
    setRightSidebarView(null);
  }, [dispatch, setRightSidebarView]);

  const contrastColor = useMemo(
    () => calculateContrastColor(userInfo?.color),
    [userInfo?.color]
  );

  const selectChannel = useCallback((id: string) => {
    setLeftSidebarView('spaces');
    dispatch(app.actions.selectChannelOrConversation(id));
  }, [dispatch, setLeftSidebarView]);


  const toggleBlockAsync = useAsync(toggleBlocked);

  return (userInfo?.dmToken !== undefined) ? (
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
        {userInfo.dmToken && (
          <button className='w-full flex space-x-4 text-lg items-center group hover:text-primary hover:bg-charcoal-3-20 rounded-xl py-4 px-6' onClick={() => {
            if (userInfo.dmToken) {
              createConversation({
                ...userInfo,
                token: userInfo.dmToken
              });
            }
          }}>
            <Envelope className='w-6 h-6 group-hover:text-primary  text-charcoal-1' />
            <span>{t('Direct Message')}</span>
          </button>
        )}
        {!isSelf && (
          <>
            <button
              disabled={toggleBlockAsync.status === 'pending'}
              onClick={() => toggleBlockAsync.execute(userInfo?.pubkey ?? '')}
              className={cn('w-full flex space-x-4 text-lg items-center group hover:text-primary hover:bg-charcoal-3-20 rounded-xl py-4 px-6', {
                'text-white': !isBlocked,
                'text-primary': isBlocked
              })}>
              {toggleBlockAsync.status === 'pending' ? (
                <Spinner className='inline -m-1 w-6 h-6' size='sm' />
              ) : (
                <>
                  <Block className={cn('w-6 h-6 group-hover:text-primary', {
                    'text-charcoal-1': !isBlocked,
                    'text-primary': isBlocked
                  })} />
                </>
              )}
              <span>{isBlocked ? t('Blocked') : t('Block')}</span>
            </button>
            {(currentChannel && currentChannel.isAdmin) && (
              <button
                disabled={muteToggleAsync.status === 'pending'}
                onClick={muteToggleAsync.execute}
                className={cn('w-full flex space-x-4 text-lg items-center group hover:text-primary hover:bg-charcoal-3-20 rounded-xl py-4 px-6', {
                  'text-white': !isMuted,
                  'text-primary': isMuted
                })}>
                {muteToggleAsync.status === 'pending' ? (
                  <Spinner className='inline -m-1 w-6 h-6' size='sm' />
                ) : (
                  <>
                    <Mute className={cn('w-6 h-6 group-hover:text-primary', {
                      'text-charcoal-1': !isMuted,
                      'text-primary': isMuted
                    })} />
                  </>
                )}
                <span>{isMuted ? t('Local Muted') : t('Local Mute')}</span>
              </button>
            )}
          </>
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
  ) : null;
};

export default UserDetails;
