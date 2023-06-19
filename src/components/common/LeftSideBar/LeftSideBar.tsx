import { ChangeEvent, FC, useCallback, useMemo, useState } from 'react';
import cn from 'classnames';
import { Collapse } from 'src/components/common';

import { SpeakEasy, Plus, MissedMessagesIcon, NetworkStatusIcon, Close  } from 'src/components/icons';
import { useUI } from 'src/contexts/ui-context';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

import s from './LeftSideBar.module.scss';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import * as channels from 'src/store/channels';
import * as app from 'src/store/app';
import * as dms from 'src/store/dms';
import * as msgs from 'src/store/messages';
import Dropdown from '../Dropdown';
import Identity from '../Identity';
import SearchInput from '../SearchInput';
import useInput from 'src/hooks/useInput';
import { Contributor } from '@types';
import useChannelFavorites from 'src/hooks/useChannelFavorites';

type ChannelListItemProps = {
  currentId: string | null,
  id: string,
  name: React.ReactNode,
  onClick: (id: string) => void,
  notification: boolean;
  hasDraft: boolean;
  isFavorite?: boolean;
}

const ChannelListItem: FC<ChannelListItemProps> = ({ currentId, hasDraft, id, isFavorite, name, notification, onClick }) => {
  return(
    <div className='flex justify-between items-center' key={id}>
      <span
        className={cn(s.channelPill, 'headline--xs flex justify-between items-center', {
          [s.channelPill__active]:  id === currentId
        })}
        onClick={() => onClick(id)}
      >
        <span className='flex items-center'>
          {name}
          {isFavorite && (
            <FontAwesomeIcon className='ml-1 inline-block w-3' color='var(--orange)' icon={faStar} />
          )}
        </span>
        <span className='flex items-center justify-end'>
          {notification && (
            <span className='mr-1'>
              <MissedMessagesIcon></MissedMessagesIcon>
            </span>
          )}
          {!notification && hasDraft && (
            <span className='mr-1'>
              <MissedMessagesIcon muted={true}></MissedMessagesIcon>
            </span>
          )}
        </span>
      </span>
    </div>
  )
}

const LeftSideBar: FC<{ cssClasses?: string; }> = ({ cssClasses }) => {
  const [contributorsSearch, setContributorsSearch] = useInput('');
  const [showCreateNewChannel, setShowCreateNewChannel] = useState(false);
  const [showSearchContributors, setShowContributors] = useState(false);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { openModal, setModalView } = useUI();
  const {
    getClientVersion,
    getVersion,
  } = useNetworkClient();
  const { favorites } = useChannelFavorites();
  const currentId = useAppSelector(app.selectors.currentChannelOrConversationId);
  const channelsSearch = useAppSelector(app.selectors.channelsSearch);
  const drafts = useAppSelector((state) => state.app.messageDraftsByChannelId);
  const allChannels = useAppSelector(channels.selectors.searchFilteredChannels(favorites));
  const missedMessages = useAppSelector(app.selectors.missedMessages);
  const allConversations = useAppSelector(dms.selectors.searchFilteredConversations(favorites));
  const messageableContributors = useAppSelector(msgs.selectors.messageableContributors);

  const filteredMessageableContributors = useMemo(
    () => messageableContributors.filter(
      (c) => c.codename.toLocaleLowerCase().includes(contributorsSearch.toLocaleLowerCase())
      || c.nickname?.toLocaleLowerCase().includes(contributorsSearch.toLocaleLowerCase())),
    [contributorsSearch, messageableContributors]
  )
  const selectChannel = useCallback((chId: string) => () => {
    dispatch(app.actions.selectChannel(chId));
  }, [dispatch]);

  const updateChannelsSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    dispatch(app.actions.updateChannelsSearch(e.target.value));
  }, [dispatch]);

  const channelsTitle = useMemo(() => (
    <div className={cn('flex justify-between')}>
      <span>{t('Joined')}</span>
      <div className='flex items-center'>
        <Plus
          data-testid='create-channel-dropdown-button'
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
  ), [t]);

  const dmsTitle = useMemo(() => (
    <div className={cn('flex justify-between')}>
      <span>{t('Direct Messages')}</span>
      <div className='flex items-center'>
        <Plus
          className={cn('mr-1', s.plus, {})}
          onClick={(e) => {
            if (e && e.stopPropagation) {
              e.stopPropagation();
            }

            setShowContributors((v) => !v);
          }}
        />
        
      </div>
    </div>
  ), [t]);

  const onSelectContributor = useCallback((c: Contributor) => () => {
    const currentConversation = allConversations.find((convo) => convo.pubkey === c.pubkey);
    if (!currentConversation && c.dmToken !== undefined) {
      dispatch(dms.actions.upsertConversation({
        pubkey: c.pubkey,
        token: c.dmToken,
        codeset: c.codeset,
        codename: c.codename,
        color: c.color ?? '#fefefe',
        blocked: false,
      }));
    }
    dispatch(app.actions.selectChannel(c.pubkey));
    setShowContributors(false);
  }, [allConversations, dispatch])

  return (
    <div data-testid='left-side-bar' className={cn(s.root, cssClasses)}>
      <div className={s.header}>
        <div className={s.logo}>
          <SpeakEasy data-testid='main-speakeasy-logo' />
        </div>
        <NetworkStatusIcon />
      </div>
      <div className={cn(s.content, 'relative')}>
        <SearchInput
          onChange={updateChannelsSearch}
          value={channelsSearch} />
        {showCreateNewChannel && (
          <Dropdown isOpen={showCreateNewChannel} onChange={setShowCreateNewChannel}>
            <ul style={{ backgroundColor: 'var(--dark-2)', zIndex: 2 }} className='text-right w-full rounded-lg p-2 bold'>
              <li className='px-2 py-1'>
                <button
                  data-testid='create-channel-button'
                  className='underline'
                  onClick={() => {
                  setModalView('CREATE_CHANNEL');
                  openModal();
                  setShowCreateNewChannel(false);
                }}>
                  {t('Create new')}
                </button>
              </li>
              <li className='px-2 py-1'>
                <button className='underline' onClick={() => {
                  setModalView('JOIN_CHANNEL');
                  openModal();
                  setShowCreateNewChannel(false);
                }}>
                  {t('Join existing by url')}
                </button>
              </li>
            </ul>
          </Dropdown>
        )}
        <Collapse className='mb-3' title={channelsTitle} defaultActive>
          <div className='flex flex-col'>
            {allChannels.map((ch) => (
              <ChannelListItem
                key={ch.id}
                {...ch}
                isFavorite={favorites.includes(ch.id)}
                currentId={currentId}
                onClick={selectChannel(ch.id)}
                notification={!!missedMessages[ch.id]}
                hasDraft={!!drafts[ch.id]}
              />
            ))}
          </div>
        </Collapse>
        {showSearchContributors && (
          <Dropdown isOpen={showSearchContributors} onChange={setShowContributors}>
            <div className='relative'>
              <Close className='cursor-pointer absolute right-0 top-0' width='14' onClick={() => setShowContributors(false)} />
              <div className='pr-6'>
                <SearchInput value={contributorsSearch}  onChange={setContributorsSearch} />
              </div>
              <div className='flex flex-col overflow-y-auto overflow-x-hidden h-64'>
                {filteredMessageableContributors.map((c) => (
                  <button
                    onClick={onSelectContributor(c)}
                    className='text-left'
                    key={c.pubkey}
                    style={{
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      color: 'var(--text-muted)'
                    }}>
                    <Identity disableMuteStyles  {...c} />
                  </button>
                ))}
              </div>
            </div>
          </Dropdown>
        )}
        <Collapse title={dmsTitle} defaultActive>
          {allConversations.map((c) => (
            <ChannelListItem
              key={c.pubkey}
              id={c.pubkey}
              currentId={currentId}
              isFavorite={favorites.includes(c.pubkey)}
              onClick={selectChannel(c.pubkey)}
              name={<Identity disableMuteStyles {...c} />}
              notification={!!missedMessages[c.pubkey]}
              hasDraft={!!drafts[c.pubkey]}
            />
          ))}
        </Collapse>
      </div>
      <div className={s.footer}>
        <div className={cn(s.version)}>
          {getClientVersion() && <span>{t('XXDK version {{version}}', { version: getClientVersion() })}</span>}
          {getVersion() && <span>{t('Wasm version {{version}}', { version: getVersion() })}</span>}
          <span>{t('App version {{version}}', { version: process.env.NEXT_PUBLIC_APP_VERSION })}</span>
        </div>
      </div>
    </div>
  );
};

export default LeftSideBar;
