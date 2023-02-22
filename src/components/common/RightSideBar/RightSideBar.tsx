import { FC, useCallback } from 'react';
import cn from 'classnames';

import { Collapse } from 'src/components/common';
import { DoubleLeftArrows, DoubleRightArrows, Settings } from 'src/components/icons';
import { useUI } from 'src/contexts/ui-context';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { Elixxir } from 'src/components/icons';

import s from './RightSideBar.module.scss';
import Identity from '../Identity';
import * as channels from 'src/store/channels';
import * as identity from 'src/store/identity';
import * as messages from 'src/store/messages';
import { useAppSelector } from 'src/store/hooks';

type Props = {
  cssClasses?: string
  collapsed: boolean;
  onToggle: () => void;
}

const RightSideBar: FC<Props> = ({ collapsed, cssClasses, onToggle }) => {
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const { codename, color } = useAppSelector(identity.selectors.identity) ?? {};
  const { getNickName } = useNetworkClient();
  const contributors = useAppSelector(messages.selectors.currentContributors);
  const { openModal, setModalView } = useUI();
  const nickName = currentChannel && getNickName();
  const Icon = collapsed ? DoubleLeftArrows : DoubleRightArrows;

  const openSettingsModal = useCallback(() => {
    setModalView('SETTINGS');
    openModal();
  }, [openModal, setModalView]);

  return (
    <div
      className={cn(s.root, cssClasses, { [s.collapsed]: collapsed })}
    >
      <div className={s.header}>
        <Icon
          onClick={onToggle}
          className={cn('cursor-pointer', s.icon)}
        />
        <div
          className={cn('w-full flex justify-between items-center', s.settingsWrapper)}
        >
          <p>
            You are connected as
            <br />
            <span
              style={{ color }}
              className={cn(s.currentUser)}
            >
              <Elixxir
                style={{ fill: color, width: '10px' }}
              />
              {codename}
            </span>
          </p>
          <Settings
            className={s.icon}
            style={{ cursor: 'pointer' }}
            onClick={openSettingsModal}
          />
        </div>
      </div>
      <div className={s.content}>
        {currentChannel && (
          <Collapse title='Recent Contributors' defaultActive>
            <div className='flex flex-col'>
              <div className={cn(s.channelPill, 'headline--xs flex flex-col')}>
                {nickName?.length ? (
                  <span style={{ color }} className={s.currentUser}>
                    {nickName} (you)
                  </span>
                ) : (
                  <span
                    style={{ color }}
                    className={cn('flex items-center', s.currentUser)}
                  >
                    <Elixxir style={{ fill: color, width: '10px' }} />
                    {codename} (you)
                  </span>
                )}

                <span
                  style={{
                    color: 'var(--cyan)'
                  }}
                  className='cursor-pointer underline mt-1'
                  onClick={() => {
                    setModalView('SET_NICK_NAME');
                    openModal();
                  }}
                >
                  {nickName?.length ? 'CHANGE' : 'SET NICKNAME'}
                </span>
              </div>

              {contributors
                .filter((c) => c.codename !== codename)
                .map((c) =>  (
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <Identity  {...c} />
                </div>
              ))}
            </div>
          </Collapse>
        )}
      </div>
    </div>
  );
};

export default RightSideBar;
