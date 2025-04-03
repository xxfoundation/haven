import React, { ChangeEvent, useCallback, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import cn from 'classnames';

import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import * as dms from 'src/store/dms';
import * as app from 'src/store/app';
import SearchInput from '../SearchInput';
import useChannelFavorites from 'src/hooks/useChannelFavorites';
import Space from '../Spaces/Space';
import Add from 'src/components/icons/Add';
import { useUI } from '@contexts/ui-context';
import Button from '../Button';
import Identity from '../Identity';

const DMs = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { openModal, setModalView } = useUI();
  const { favorites, loading: favsLoading } = useChannelFavorites();
  const dmsSearch = useAppSelector(app.selectors.dmsSearch);
  const allConversations = useAppSelector(dms.selectors.conversations);
  const filteredConversations = useAppSelector(
    dms.selectors.searchFilteredConversations(favorites)
  );
  const selectedChannelId = useAppSelector(app.selectors.currentChannelOrConversationId);
  const currentConversation = useAppSelector(dms.selectors.currentConversation);
  const msgs = useAppSelector(dms.selectors.sortedDmsByPubkey);
  const missedMessages = useAppSelector(app.selectors.missedMessages);

  const selectChannel = useCallback(
    (chId: string) => {
      dispatch(app.actions.selectChannelOrConversation(chId));
    },
    [dispatch]
  );

  const updateDmsSearch = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(app.actions.updateDmsSearch(e.target.value));
    },
    [dispatch]
  );

  useEffect(() => {
    if (!currentConversation && filteredConversations.length > 0 && !favsLoading) {
      dispatch(app.actions.selectChannelOrConversation(filteredConversations[0]?.pubkey));
    }
  }, [filteredConversations, currentConversation, dispatch, favsLoading]);

  return (
    <div className='bg-our-black p-4 pb-8 h-full'>
      {allConversations.length > 0 && (
        <div className='flex items-center relative mb-2'>
          <SearchInput
            size='sm'
            className='mb-0 flex-grow'
            onChange={updateDmsSearch}
            value={dmsSearch}
          />
          <button
            onClick={() => {
              setModalView('NEW_DM');
              openModal();
            }}
          >
            <Add className='text-primary' />
          </button>
        </div>
      )}
      <div className='space-y-1'>
        {allConversations.length > 0 && filteredConversations.length === 0 && (
          <p className='p-3 text-sm text-orange'>
            {t('No conversations found with your search criteria')}
          </p>
        )}
        {filteredConversations.map((convo, i) => {
          const latestMsg = msgs[convo.pubkey]?.[msgs[convo.pubkey]?.length - 1];
          const active = selectedChannelId === convo.pubkey;
          const nextActive = filteredConversations[i + 1]?.pubkey === selectedChannelId;

          return (
            <React.Fragment key={convo.pubkey}>
              <label htmlFor='mobileToggle' key={convo.pubkey}>
                <Space
                  favorite={favorites.includes(convo.pubkey)}
                  missedMessagesCount={missedMessages?.[convo.pubkey]?.length ?? 0}
                  message={latestMsg?.plaintext ?? ''}
                  date={latestMsg?.timestamp}
                  name={<Identity {...convo} />}
                  active={active}
                  onClick={() => selectChannel(convo.pubkey)}
                />
              </label>
              <hr
                className={cn('border-charcoal-4 border-1', {
                  invisible: active || nextActive
                })}
              />
            </React.Fragment>
          );
        })}
      </div>
      {allConversations.length === 0 && (
        <div className='px-8 py-12 space-y-8'>
          <h3>{t('Direct Messages')}</h3>
          <p className='text-primary text-xl leading-relaxed font-thin'>
            <Trans>
              This is the beginning of your{' '}
              <strong className='text-white font-semibold'>completely private</strong> messaging
              experience.
            </Trans>
          </p>
          <div className='space-y-4'>
            <Button
              onClick={() => {
                setModalView('NEW_DM');
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
  );
};

export default DMs;
