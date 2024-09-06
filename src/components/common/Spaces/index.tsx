import React, { ChangeEvent, useCallback, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import cn from 'classnames';

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
import { useUI } from '@contexts/ui-context';

import havenLogo from 'src/assets/images/haven-logo.svg';
import Button from '../Button';
import { Join, Plus } from '@components/icons';

const Spaces = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { openModal, setModalView } = useUI();
  const { favorites, loading: favsLoading } = useChannelFavorites();
  const channelsSearch = useAppSelector(app.selectors.channelsSearch);
  const allChannels = useAppSelector(channels.selectors.channels);
  const filteredChannels = useAppSelector(channels.selectors.searchFilteredChannels(favorites));
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
    if (!currentChannel && filteredChannels.length > 0 && !favsLoading) {
      dispatch(app.actions.selectChannelOrConversation(filteredChannels[0]?.id))
    }
  }, [filteredChannels, currentChannel, dispatch, favorites, favsLoading]);

  useEffect(() => {
  }, [filteredChannels])

  return (
    <div className={s.root}>
      {allChannels.length > 0 && (
        <div className='flex items-center relative mb-2'>
          <SearchInput
            size='sm'
            className='mb-0 flex-grow'
            onChange={updateChannelsSearch}
            value={channelsSearch} />
          <button onClick={() => set(true)}>
            <Add className='text-primary' />
          </button>
          <Dropdown isOpen={dropdownToggled} onChange={set}>
            <DropdownItem
            icon={Plus}
              onClick={() => {
                setModalView('CREATE_CHANNEL');
                openModal();
              }}
            >
              {t('Create New Space')}
            </DropdownItem>
            <DropdownItem
              icon={Join}
              onClick={() => {
                setModalView('JOIN_CHANNEL');
                openModal();
              }}>
              {t('Join Space')}
            </DropdownItem>
          </Dropdown>
        </div>
      )}
      <div className='space-y-1'>
        {allChannels.length > 0 && filteredChannels.length === 0 && (
          <p className='p-3  text-sm text-orange'>{t('No channels found with your search criteria')}</p>
        )}
        {filteredChannels.map((channel, i) => {
          const latestMsg = msgs[channel.id]?.[msgs[channel.id]?.length - 1];
          const active = selectedChannelId === channel.id;
          const nextActive = filteredChannels[i + 1]?.id === selectedChannelId;
          
          return (
            <React.Fragment key={channel.id}>
              <Space
                favorite={favorites.includes(channel.id)}
                missedMessagesCount={missedMessages?.[channel.id]?.length ?? 0}
                message={latestMsg?.plaintext ?? ''}
                date={latestMsg?.timestamp}
                name={channel.name}
                active={active}
                onClick={() => { selectChannel(channel.id); } }
              />
              <hr className={cn('border-charcoal-4 border-1', { invisible: active || nextActive })} />
            </React.Fragment>
          );
        })}
      </div>
      {allChannels.length === 0 && (
        <div className='px-8 py-12 space-y-8'>
          <img src={havenLogo.src} />
          <p className='text-primary text-xl leading-relaxed font-thin'>
            <Trans>
              This is the beginning of
              your <strong className='text-white font-semibold'>completely private</strong> 
              messaging experience.
            </Trans>
          </p>
          <div className='space-y-4'>
            <Button 
              onClick={() => {
                setModalView('CREATE_CHANNEL');
                openModal();
              }}
              className='w-full'
            >
              {t('Create Space')}
            </Button>
            <Button
              onClick={() => {
                setModalView('JOIN_CHANNEL');
                openModal();
              }}
              variant='outlined'
              className='w-full'>
              {t('Join space')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
};

export default Spaces;
