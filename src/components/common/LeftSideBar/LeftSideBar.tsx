import { FC, useCallback } from 'react';
import s from './LeftSideBar.module.scss';
import cn from 'classnames';
import {
  Collapse,
} from 'src/components/common';

import { Elixxir, SpeakEasy, Settings, Plus, Join, MissedMessagesIcon, NetworkStatusIcon  } from 'src/components/icons';
import { useUI } from 'src/contexts/ui-context';
import { useNetworkClient } from 'src/contexts/network-client-context';

const LeftSideBar: FC<{
  cssClasses?: string;
}> = ({ cssClasses }) => {
  const { openModal, setModalView } = useUI();

  const {
    channels,
    currentChannel,
    getClientVersion,
    getIdentity,
    getVersion,
    setCurrentChannel
  } = useNetworkClient();

  const codeName = getIdentity()?.Codename;
  let color = getIdentity()?.Color;
  if (color) {
    color = color.replace('0x', '#');
  }

  const onChannelChange = useCallback((chId: string) => () => {
    const selectedChannel = channels.find(ch => ch.id === chId);
    if (selectedChannel) {
      setCurrentChannel(selectedChannel);
    }
  }, [channels, setCurrentChannel]);

  const openSettingsModal = useCallback(() => {
    setModalView('SETTINGS');
    openModal();
  }, [openModal, setModalView])

  const collapseTitle = (
    <div className={cn('flex justify-between')}>
      <span>JOINED</span>

      <div className='flex items-center'>
        <Plus
          className={cn('mr-1', s.plus, {})}
          onClick={(e) => {
            if (e && e.stopPropagation) {
              e.stopPropagation();
            }

            setModalView('CREATE_CHANNEL');
            openModal();
            // }
          }}
        />
        <Join
          className={cn(s.join, {})}
          onClick={(e) => {
            if (e && e.stopPropagation) {
              e.stopPropagation();
            }
            setModalView('JOIN_CHANNEL');
            openModal();
          }}
        />
      </div>
    </div>
  );

  return (
    <div className={cn(s.root, cssClasses)}>
      <div className={s.header}>
        <div className={s.logo}>
          <SpeakEasy />
        </div>
        <NetworkStatusIcon />
      </div>
      <div className={s.content}>
        <Collapse title={collapseTitle} defaultActive>
          <div className='flex flex-col'>
            {channels.map(ch => (
                <div className='flex justify-between items-center' key={ch.id}>
                  <span
                    style={{ color: ch.isAdmin ? 'gold' : 'inherit'}}
                    title={ch.isAdmin ? 'You are admin in this channel' : undefined}
                    className={cn(s.channelPill, 'headline--xs', {
                      [s.channelPill__active]:
                        ch.id === (currentChannel?.id || '')
                    })}
                    onClick={onChannelChange(ch.id)}
                  >
                    {ch.name}
                  </span>
                  {ch.withMissedMessages && (
                    <span className='mr-2'>
                      <MissedMessagesIcon></MissedMessagesIcon>
                    </span>
                  )}
                </div>
              )
            )}
          </div>
        </Collapse>
      </div>
      <div className={s.footer}>
        <div
          className={cn('flex justify-between items-center', s.settingsWrapper)}
        >
          <div className={cn('mr-2 flex flex-col', s.currentUserWrapper)}>
            <span>You are now connected as</span>
            <span
              style={{ color }}
              className={cn('flex items-center', s.currentUser)}
            >
              <Elixxir
                style={{ fill: color, width: '10px', marginTop: '-3px' }}
              />
              {codeName}
            </span>
          </div>
          <Settings
            style={{ cursor: 'pointer' }}
            onClick={openSettingsModal}
          />
        </div>
        <div className={cn(s.version)}>
          {getClientVersion() && <span>XXDK version {getClientVersion()}</span>}
          {getVersion() && <span>Wasm version {getVersion()}</span>}
          <span>App version 0.1.2</span>
        </div>
      </div>
    </div>
  );
};

export default LeftSideBar;
