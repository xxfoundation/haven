import React, { ChangeEvent, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import * as channels from 'src/store/channels';
import * as app from 'src/store/app';
import SearchInput from '../SearchInput';
import useChannelFavorites from 'src/hooks/useChannelFavorites';
import s from './styles.module.scss';

const Spaces = () => {
  const dispatch = useAppDispatch();
  const { favorites } = useChannelFavorites();
  const channelsSearch = useAppSelector(app.selectors.channelsSearch);
  const allChannels = useAppSelector(channels.selectors.searchFilteredChannels(favorites));
  
  const selectChannel = useCallback((chId: string) => () => {
    dispatch(app.actions.selectChannel(chId));
  }, [dispatch]);

  const updateChannelsSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    dispatch(app.actions.updateChannelsSearch(e.target.value));
  }, [dispatch]);

  return (
    <div className={s.root}>
      <SearchInput
        onChange={updateChannelsSearch}
        value={channelsSearch} />
    </div>
  )
};

export default Spaces;
