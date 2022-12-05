import { FC, useState, useEffect } from 'react';
import s from './RightSideBar.module.scss';
import cn from 'classnames';
import { Button, Collapse } from 'src/components/common';
import { DoubleLeftArrows, DoubleRightArrows } from 'src/components/icons';
import { useSpring, a } from '@react-spring/web';
import { useUI } from 'src/contexts/ui-context';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { Elixxir } from 'src/components/icons';

const RightSideBar: FC<{ cssClasses?: string }> = ({ cssClasses }) => {
  const {
    channels,
    currentChannel,
    getIdentity,
    getNickName,
    messages
  } = useNetworkClient();
  const [currentContributors, setCurrentContributors] = useState<any>([]);

  const currentChannelMessages = messages.filter(
    m => m.channelId === (currentChannel?.id || '')
  );

  useEffect(() => {
    const updated = [
      ...Array.from(
        new Map(
          currentChannelMessages.map(item => [item.codeName, item])
        ).values()
      )
    ];
    setCurrentContributors(updated);
  }, [currentChannelMessages?.length]);

  const { openModal, setModalView } = useUI();
  const [isActive, setIsActive] = useState<boolean>(true);

  const codeName = getIdentity().Codename;
  let color = getIdentity().Color;
  if (color) {
    color = color.replace('0x', '#');
  }
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

  const toggleIsActive = () => {
    setIsActive(!isActive);
  };
  const Icon = ({
    cssClass,
    onClick
  }: {
    onClick: Function;
    cssClass?: string;
  }) => {
    return isActive ? (
      <DoubleRightArrows onClick={onClick} className={cn(cssClass)} />
    ) : (
      <DoubleLeftArrows onClick={onClick} className={cn(cssClass)} />
    );
  };
  return (
    <a.div
      className={cn(s.root, cssClasses, { [s.root__collapsed]: !isActive })}
      style={{ overflow: 'hidden', ...animProps1 }}
    >
      <div className={s.header}>
        <Icon
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

              {currentContributors.map((c: any) => {
                if (c.codeName === codeName) {
                  return null;
                } else {
                  const color = c?.color.replace('0x', '#');

                  return (
                    <span
                      className={cn(s.sender, 'flex items-center')}
                      key={c.codeName}
                      style={{
                        padding: '6px'
                      }}
                    >
                      {c.nickName && (
                        <span
                          style={{ color: `${color}`, marginRight: '6px' }}
                          className={cn('headline--xs', s.nickNameWrapper)}
                        >
                          {c.nickName}
                        </span>
                      )}
                      <span
                        className={cn('flex items-center', s.codeNameWrapper)}
                      >
                        <Elixxir
                          style={
                            c.nickName ? { fill: '#73767C' } : { fill: color }
                          }
                        />
                        <span
                          style={
                            c.nickName ? { color: '#73767C' } : { color: color }
                          }
                          className='headline--xs'
                        >
                          {c.codeName}
                        </span>
                      </span>
                    </span>
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
