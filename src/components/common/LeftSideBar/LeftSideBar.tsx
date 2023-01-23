import { FC, useCallback, useMemo, useRef } from 'react';
import cn from 'classnames';
import { useOnClickOutside } from 'usehooks-ts';
import {
  Collapse,
} from 'src/components/common';

import { Elixxir, SpeakEasy, Settings, Plus, MissedMessagesIcon, NetworkStatusIcon  } from 'src/components/icons';
import { useUI } from 'src/contexts/ui-context';
import { useNetworkClient } from 'src/contexts/network-client-context';
import useToggle from 'src/hooks/useToggle';

import s from './LeftSideBar.module.scss';

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

  const codename = getIdentity()?.Codename;
  const color = getIdentity()?.Color.replace('0x', '#');;

  const onChannelChange = useCallback((chId: string) => () => {
    const selectedChannel = channels.find(ch => ch.id === chId);
    if (selectedChannel) {
      setCurrentChannel(selectedChannel);
    }
  }, [channels, setCurrentChannel]);

  const sortedChannels = useMemo(
    () => channels.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [channels]
  );

  const openSettingsModal = useCallback(() => {
    setModalView('SETTINGS');
    openModal();
  }, [openModal, setModalView]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showCreateNewChannel, { toggle: toggleChannelCreationMenu, toggleOff: hideMenu }] = useToggle();
  useOnClickOutside(dropdownRef, hideMenu);

  const collapseTitle = useMemo(() => (
    <div className={cn('flex justify-between')}>
      <span>JOINED</span>
      <div className='flex items-center'>
        <Plus
          className={cn('mr-1', s.plus, {})}
          onClick={(e) => {
            if (e && e.stopPropagation) {
              e.stopPropagation();
            }

            toggleChannelCreationMenu();
          }}
        />
        
      </div>
    </div>
  ), [toggleChannelCreationMenu]);

  return (
    <div className={cn(s.root, cssClasses)}>
      <div className={s.header}>
        <div className={s.logo}>
          <SpeakEasy />
        </div>
        <NetworkStatusIcon />
      </div>
      <div className={cn(s.content, 'relative')}>
        {showCreateNewChannel && (
          <div ref={dropdownRef} className='absolute p-2 w-full  left-0 mt-6'>
            <ul style={{ backgroundColor: 'var(--dark-2)', zIndex: 2 }} className='text-right w-full rounded-lg p-2 bold'>
              <li className='px-2 py-1'>
                <button className='underline' onClick={() => {
                  setModalView('CREATE_CHANNEL');
                  openModal();
                  hideMenu();
                }}>
                  Create new
                </button>
              </li>
              <li className='px-2 py-1'>
                <button className='underline' onClick={() => {
                  setModalView('JOIN_CHANNEL');
                  openModal();
                  hideMenu();
                }}>
                  Join existing by url
                </button>
              </li>
            </ul>
          </div>
        )}
        <Collapse title={collapseTitle} defaultActive>
          <div className='flex flex-col'>
            {sortedChannels.map((ch) => (
              <div className='flex justify-between items-center' key={ch.id}>
                <span
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
              {codename}
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
          <span>App version 0.2.2</span>
        </div>
      </div>
    </div>
  );
};

export default LeftSideBar;
