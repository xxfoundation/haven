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
import SearchInput from '../SearchInput';

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
  const currentConversation = useAppSelector(dms.selectors.currentConversation);
  const { codename, color, pubkey } = useAppSelector(identity.selectors.identity) ?? {};
  const contributors = useAppSelector(messages.selectors.currentContributors);

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

  const hasChannelOrConversationActive = !!currentConversation || !!currentChannel;

  return (
    <div
      data-testid='right-side-bar'
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
        <SearchInput
          onChange={updateContributorsSearch}
          value={contributorsSearch}/>
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
                {hasChannelOrConversationActive && (
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
                )}
                
            </div>

            {contributors?.filter((c) => c.pubkey !== pubkey)
              .map((c) =>  (
              <div key={c.pubkey} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-muted)' }}>
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
