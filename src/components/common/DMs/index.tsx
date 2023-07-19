import React, { ChangeEvent, useCallback, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import * as app from 'src/store/app';
import SearchInput from '../SearchInput';
import useChannelFavorites from 'src/hooks/useChannelFavorites';
import s from 'src/components/common/Spaces/styles.module.scss';
import * as dms from 'src/store/dms';
import Add from 'src/components/icons/Add';
import useToggle from 'src/hooks/useToggle';
import Dropdown, { DropdownItem } from '../Dropdown';
import addButton from 'src/assets/images/add.svg';
import joinButton from 'src/assets/images/join.svg';
import { useUI } from '@contexts/ui-context';
import Space from 'src/components/common/Spaces/Space';
import Identity from '../Identity';
import Button from '../Button';

const DMs = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { openModal, setModalView } = useUI();
  const { favorites, loading: favsLoading } = useChannelFavorites();
  const dmsSearch = useAppSelector(app.selectors.dmsSearch);
  const conversations = useAppSelector(dms.selectors.searchFilteredConversations(favorites));
  const selectedChannelId = useAppSelector(app.selectors.currentChannelOrConversationId);
  const currentConversation = useAppSelector(dms.selectors.currentConversation);
  const msgs = useAppSelector(dms.selectors.sortedDmsByPubkey);
  const missedMessages = useAppSelector(app.selectors.missedMessages);

  const selectChannel = useCallback((chId: string) => {
    dispatch(app.actions.selectChannelOrConversation(chId));
  }, [dispatch]);

  const updateDmsSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    dispatch(app.actions.updateDmsSearch(e.target.value));
  }, [dispatch]);

  useEffect(() => {
    if (!currentConversation && conversations.length > 0 && !favsLoading) {
      dispatch(app.actions.selectChannelOrConversation(conversations[0]?.pubkey))
    }
  }, [conversations, currentConversation, dispatch, favsLoading]);

  const [dropdownToggled, { set }] = useToggle();

  return (
    <div className={s.root}>
      <div className='flex items-center relative mb-2'>
        <SearchInput
          size='sm'
          className='mb-0 flex-grow'
          onChange={updateDmsSearch}
          value={dmsSearch} />
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
        {conversations.map((convo) => {
          const latestMsg = msgs[convo.pubkey]?.[msgs[convo.pubkey]?.length - 1];
          return (
            <>
            <Space
              favorite={favorites.includes(convo.pubkey)}
              missedMessagesCount={missedMessages?.[convo.pubkey]?.length ?? 0}
              message={latestMsg?.plaintext ?? ''}
              date={latestMsg?.timestamp}
              name={<Identity {...convo} />}
              active={selectedChannelId === convo.pubkey}
              onClick={() => { selectChannel(convo.pubkey); } }
            />
            <hr className='border-charcoal-4 border-1' />
            </>
          );
        })}
        
      </div>
      {conversations.length === 0 && (
        <div className='px-8 py-12 space-y-8'>
          <h3>{t('Direct Messages')}</h3>
          <p className='text-primary text-xl leading-relaxed font-thin'>
            <Trans>
              This is the beginning of
              your <strong className='text-white font-semibold'>quantum-secure</strong> and
              completely private messaging experience.
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
              {t('Send a Direct Message')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
};

export default DMs;
