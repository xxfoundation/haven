import { FC, useCallback, useMemo, useState } from 'react';
import cn from 'classnames';
import { Collapse } from 'src/components/common';

import { SpeakEasy, Plus, MissedMessagesIcon, NetworkStatusIcon  } from 'src/components/icons';
import { useUI } from 'src/contexts/ui-context';
import { useNetworkClient } from 'src/contexts/network-client-context';

import s from './LeftSideBar.module.scss';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import * as channels from 'src/store/channels';
import * as app from 'src/store/app';
import Dropdown from '../Dropdown';

const LeftSideBar: FC<{ cssClasses?: string; }> = ({ cssClasses }) => {
  const dispatch = useAppDispatch();
  const { openModal, setModalView } = useUI();

  const {
    getClientVersion,
    getVersion,
  } = useNetworkClient();

  const allChannels = useAppSelector(channels.selectors.channels);
  const currentChannel = useAppSelector(channels.selectors.currentChannel);

  const onChannelChange = useCallback((chId: string) => () => {
    dispatch(app.actions.selectChannel(chId));
    dispatch(channels.actions.dismissNewMessagesNotification(chId))
  }, [dispatch]);

  const [showCreateNewChannel, setShowCreateNewChannel] = useState(false);

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

            setShowCreateNewChannel((v) => !v);
          }}
        />
        
      </div>
    </div>
  ), []);

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
          <Dropdown isOpen={showCreateNewChannel} onChange={setShowCreateNewChannel}>
            <ul style={{ backgroundColor: 'var(--dark-2)', zIndex: 2 }} className='text-right w-full rounded-lg p-2 bold'>
              <li className='px-2 py-1'>
                <button className='underline' onClick={() => {
                  setModalView('CREATE_CHANNEL');
                  openModal();
                  setShowCreateNewChannel(false);
                }}>
                  Create new
                </button>
              </li>
              <li className='px-2 py-1'>
                <button className='underline' onClick={() => {
                  setModalView('JOIN_CHANNEL');
                  openModal();
                  setShowCreateNewChannel(false);
                }}>
                  Join existing by url
                </button>
              </li>
            </ul>
          </Dropdown>
        )}
        <Collapse title={collapseTitle} defaultActive>
          <div className='flex flex-col'>
            {allChannels.map((ch) => (
              <div className='flex justify-between items-center' key={ch.id}>
                <span
                  title={ch.isAdmin ? 'You are admin in this channel' : undefined}
                  className={cn(s.channelPill, 'headline--xs', {
                    [s.channelPill__active]:
                      ch.id === (currentChannel?.id || '')
                  })}
                  onClick={(onChannelChange(ch.id))}
                >
                  {ch.name}
                </span>
                {ch.hasMissedMessages && (
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
        <div className={cn(s.version)}>
          {getClientVersion() && <span>XXDK version {getClientVersion()}</span>}
          {getVersion() && <span>Wasm version {getVersion()}</span>}
          <span>App version 0.2.10</span>
        </div>
      </div>
    </div>
  );
};

export default LeftSideBar;
