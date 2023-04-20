import { ChangeEvent, FC, useCallback } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import { Collapse } from 'src/components/common';
import { DoubleLeftArrows, DoubleRightArrows, Settings } from 'src/components/icons';
import { useUI } from 'src/contexts/ui-context';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { Elixxir } from 'src/components/icons';

import s from './RightSideBar.module.scss';
import Identity from '../Identity';
import * as app from 'src/store/app';
import * as channels from 'src/store/channels';
import * as identity from 'src/store/identity';
import * as messages from 'src/store/messages';
import * as dms from 'src/store/dms';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';

type Props = {
  cssClasses?: string
  collapsed: boolean;
  onToggle: () => void;
}

const RightSideBar: FC<Props> = ({ collapsed, cssClasses, onToggle }) => {
  const { t } = useTranslation();
  const { getNickName } = useNetworkClient();
  const { openModal, setModalView } = useUI();
  const dispatch = useAppDispatch();

  const contributorsSearch = useAppSelector(app.selectors.contributorsSearch);
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const { codename, color, pubkey } = useAppSelector(identity.selectors.identity) ?? {};
  const contributors = useAppSelector(messages.selectors.currentContributors);
  const dmNickname = useAppSelector(dms.selectors.dmNickname);

  const channelNickname = currentChannel && getNickName();
  const nickname = currentChannel ? channelNickname : dmNickname;

  const Icon = collapsed ? DoubleLeftArrows : DoubleRightArrows;

  const openSettingsModal = useCallback(() => {
    setModalView('SETTINGS');
    openModal();
  }, [openModal, setModalView]);

  const updateContributorsSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    dispatch(app.actions.updateContributorsSearch(e.target.value));
  }, [dispatch]);

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
            {t('You are connected as')}
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
        <div className={s.search}>
          <input
            onChange={updateContributorsSearch}
            value={contributorsSearch}
            placeholder={t('Search...')} />
          <div className='absolute inset-y-0 right-2 flex items-center pl-3 pointer-events-none'>
            <svg aria-hidden='true' className='w-5 h-5 text-gray-500 dark:text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'></path></svg>
          </div>
        </div>
        <Collapse title={t('Recent Contributors')} defaultActive>
          <div className='flex flex-col'>
            <div className={cn(s.channelPill, 'headline--xs flex flex-col')}>
              {nickname?.length ? (
                <span style={{ color }} className={s.currentUser}>
                  {nickname} ({t('you')})
                </span>
              ) : (
                <span
                  style={{ color }}
                  className={cn('flex items-center', s.currentUser)}
                >
                  <Elixxir style={{ fill: color, width: '10px' }} />
                  {codename} ({t('you')})
                </span>
              )}

              <span
                style={{
                  color: 'var(--cyan)'
                }}
                className='cursor-pointer uppercase underline mt-1'
                onClick={() => {
                  setModalView('SET_NICK_NAME');
                  openModal();
                }}
              >
                {nickname?.length ? t('Change') : t('Set nickname')}
              </span>
            </div>

            {contributors?.filter((c) => c.pubkey !== pubkey)
              .map((c) =>  (
              <div key={c.pubkey} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <Identity clickable {...c} />
              </div>
            ))}
          </div>
        </Collapse>
      </div>
    </div>
  );
};

export default RightSideBar;
