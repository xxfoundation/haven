import { FC, useMemo, useState, useEffect, MouseEventHandler, useCallback } from 'react';
import { useSpring, a } from '@react-spring/web';
import cn from 'classnames';

import { Button, Collapse } from 'src/components/common';
import { DoubleLeftArrows, DoubleRightArrows } from 'src/components/icons';
import { useUI } from 'src/contexts/ui-context';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { Elixxir } from 'src/components/icons';

import s from './RightSideBar.module.scss';
import Identity from '../Identity';
import * as channels from 'src/store/channels';
import * as identity from 'src/store/identity';
import * as messages from 'src/store/messages';
import { useAppSelector } from 'src/store/hooks';

type IconProps = {
  cssClass?: string;
  isActive: boolean;
  onClick: MouseEventHandler<SVGSVGElement>;
};

const Icon: FC<IconProps> = ({
  cssClass,
  isActive,
  onClick
}) => isActive
  ? (
    <DoubleRightArrows onClick={onClick} className={cn(cssClass)} />
  )
  : (
    <DoubleLeftArrows onClick={onClick} className={cn(cssClass)} />
  );



const RightSideBar: FC<{ cssClasses?: string }> = ({ cssClasses }) => {
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const { codename, color } = useAppSelector(identity.selectors.identity) ?? {};
  const { getNickName } = useNetworkClient();
  const contributors = useAppSelector(messages.selectors.contributors);
  const filtered = useMemo(() => contributors.filter((c) => c.channelId === currentChannel?.id), [contributors, currentChannel?.id])

  const { openModal, setModalView } = useUI();
  const [isActive, setIsActive] = useState<boolean>(true);

  const nickName = useMemo(() => currentChannel && getNickName(), [currentChannel, getNickName]);

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

              {filtered
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
    </a.div>
  );
};

export default RightSideBar;
