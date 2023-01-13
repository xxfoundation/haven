import { Message } from '@types';

import { FC, useMemo, useState, useEffect, MouseEventHandler, useCallback } from 'react';
import { useSpring, a } from '@react-spring/web';
import cn from 'classnames';

import { Button, Collapse } from 'src/components/common';
import { DoubleLeftArrows, DoubleRightArrows } from 'src/components/icons';
import { useUI } from 'src/contexts/ui-context';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { Elixxir } from 'src/components/icons';

import s from './RightSideBar.module.scss';
import useToggle from 'src/hooks/useToggle';
import ViewBannedUsersModal from 'src/components/modals/ViewBannedUsers';
import Identity from '../Identity';

type IconProps = {
  cssClass?: string;
  isActive: boolean;
  onClick: MouseEventHandler<SVGSVGElement>;
};

const Icon: FC<IconProps> = ({
  cssClass,
  isActive,
  onClick
}) => {
  return isActive ? (
    <DoubleRightArrows onClick={onClick} className={cn(cssClass)} />
  ) : (
    <DoubleLeftArrows onClick={onClick} className={cn(cssClass)} />
  );
};


const RightSideBar: FC<{ cssClasses?: string }> = ({ cssClasses }) => {
  const {
    currentChannel,
    getIdentity,
    getNickName,
    messages
  } = useNetworkClient();
  const [currentContributors, setCurrentContributors] = useState<Message[]>([]);
  const [
    showBannedUsers,
    { toggleOff: hideBannedUsers, toggleOn: toggleBannedUsers }
  ] = useToggle();

  const currentChannelMessages = useMemo(
    () => messages.filter(
      m => m.channelId === (currentChannel?.id || '')
    ), [currentChannel?.id, messages]
  );
  const identity = useMemo(() => getIdentity(), [getIdentity]);

  useEffect(() => {
    const updated = [
      ...Array.from(
        new Map(
          currentChannelMessages.map(item => [item.codename, item])
        ).values()
      )
    ];
    setCurrentContributors(updated);
  }, [currentChannelMessages]);

  const { openModal, setModalView } = useUI();
  const [isActive, setIsActive] = useState<boolean>(true);

  const codeName = identity?.Codename;
  const color = identity?.Color.replace('0x', '#');

  const nickName = getNickName();

  const animProps1 = useSpring({
    width: isActive ? '22%' : '40px',
    config: { duration: 100 }
  });

  useEffect(() => {
    const adjustActiveState = () => {
      if (window?.innerWidth <= 760) {
        setIsActive(false);
      }
    };
    adjustActiveState();
    window?.addEventListener('resize', adjustActiveState);
    return () => window?.removeEventListener('resize', adjustActiveState);
  }, []);

  const toggleIsActive = useCallback(() => {
    setIsActive(!isActive);
  }, [isActive]);

  return (
    <a.div
      className={cn(s.root, cssClasses, { [s.root__collapsed]: !isActive })}
      style={{ overflow: 'hidden', ...animProps1 }}
    >
      {showBannedUsers && (
        <ViewBannedUsersModal onCancel={hideBannedUsers} />
      )}
      <div className={s.header}>
        <Icon
          isActive={isActive}
          onClick={() => toggleIsActive()}
          cssClass={cn('cursor-pointer', s.icon)}
        />
        <div>
          {currentChannel && (
            <>
              <Button
                cssClasses={cn('block mx-auto mb-4')}
                disabled={!currentChannel}
                onClick={() => {
                  if (currentChannel) {
                    setModalView('SHARE_CHANNEL');
                    openModal();
                  }
                }}
              >
                Share
              </Button>
              {currentChannel?.isAdmin && (
                <Button
                  cssClasses={cn('block mx-auto mb-4')}
                  disabled={!currentChannel}
                  onClick={toggleBannedUsers}
                >
                  View Banned Users
                </Button>
              )}
              <Button
                cssClasses={cn('block mx-auto')}
                onClick={() => {
                  setModalView('CHANNEL_ACTIONS');
                  openModal();
                }}
              >
                More
              </Button>
            </>
          )}
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
                    {codeName} (you)
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

              {currentContributors.map((c) => {
                if (c.codename === codeName) {
                  return null;
                } else {
                  return (
                    <Identity {...c} />
                  );
                }
              })}
            </div>
          </Collapse>
        )}
      </div>
    </a.div>
  );
};

export default RightSideBar;
