import React, { ChangeEvent, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import * as channels from 'src/store/channels';
import * as app from 'src/store/app';
import SearchInput from '../SearchInput';
import useChannelFavorites from 'src/hooks/useChannelFavorites';
import s from './styles.module.scss';
import Space from './Space';
import * as messages from 'src/store/messages';
import Add from 'src/components/icons/Add';
import useToggle from 'src/hooks/useToggle';
import Dropdown, { DropdownItem } from '../Dropdown';
import addButton from 'src/assets/images/add.svg';
import joinButton from 'src/assets/images/join.svg';
import { useUI } from '@contexts/ui-context';

const Spaces = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { openModal, setModalView } = useUI();
  const { favorites, loading: favsLoading } = useChannelFavorites();
  const channelsSearch = useAppSelector(app.selectors.channelsSearch);
  const allChannels = useAppSelector(channels.selectors.searchFilteredChannels(favorites));
  const selectedChannelId = useAppSelector(app.selectors.currentChannelOrConversationId);
  const msgs = useAppSelector(messages.selectors.sortedMessagesByChannelId);
  const missedMessages = useAppSelector(app.selectors.missedMessages);
  const currentChannel = useAppSelector(channels.selectors.currentChannel);

  const selectChannel = useCallback((chId: string) => {
    dispatch(app.actions.selectChannelOrConversation(chId));
  }, [dispatch]);

  const updateChannelsSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    dispatch(app.actions.updateChannelsSearch(e.target.value));
  }, [dispatch]);

  const [dropdownToggled, { set }] = useToggle();

  useEffect(() => {
    if (!currentChannel && allChannels.length > 0 && !favsLoading) {
      dispatch(app.actions.selectChannelOrConversation(allChannels[0]?.id))
    }
  }, [allChannels, currentChannel, dispatch, favorites, favsLoading]);

  useEffect(() => {
  }, [allChannels])

  return (
    <div className={s.root}>
      <div className='flex items-center relative mb-2'>
        <SearchInput
          className='mb-0 flex-grow'
          onChange={updateChannelsSearch}
          value={channelsSearch} />
        <button onClick={() => set(true)}>
          <Add />
        </button>
        <Dropdown isOpen={dropdownToggled} onChange={set}>
          <DropdownItem onClick={() => {
            setModalView('CREATE_CHANNEL');
            openModal();
          }}>
            <img src={addButton.src} />
            <span>
              {t('Create New Space')}
            </span>
          </DropdownItem>
          <DropdownItem onClick={() => {
            setModalView('JOIN_CHANNEL');
            openModal();
          }}>
            <img src={joinButton.src} />
            <span>
              {t('Join Space')}
            </span>
          </DropdownItem>
        </Dropdown>
      </div>
      <div className='space-y-1'>
        {allChannels.map((channel) => {
          const latestMsg = msgs[channel.id]?.[msgs[channel.id]?.length - 1];
          return (
            <>
            <Space
              favorite={favorites.includes(channel.id)}
              missedMessagesCount={missedMessages?.[channel.id]?.length ?? 0}
              message={latestMsg?.plaintext ?? ''}
              date={latestMsg?.timestamp}
              name={channel.name}
              active={selectedChannelId === channel.id}
              onClick={() => { selectChannel(channel.id); } }
            />
            <hr className='border-charcoal-4 border-1' />
            </>
          );
        })}
      </div>
    </div>
  )
};

export default Spaces;
