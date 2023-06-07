import { useCallback  } from 'react';

import { channelFavoritesDecoder } from '@utils/decoders';
import useRemotelySynchedValue from './useRemotelySynchedValue';

const KEY = 'channel-favorites';

const useChannelFavorites = () => {
  const { loading, set, value: favorites = [] } = useRemotelySynchedValue(KEY, channelFavoritesDecoder);

  const toggleFavorite = useCallback((channelId: string) => {
    if (!loading) {
      set(favorites.includes(channelId)
        ? favorites.filter((id) => id !== channelId)
        : favorites.concat(channelId)
      )
    }
  }, [favorites, loading, set]);

  const isFavorite = useCallback(
    (channelId?: string | null) => channelId && favorites.includes(channelId),
    [favorites]
  );

  return {
    favorites,
    toggle: toggleFavorite,
    isFavorite
  }
};

export default useChannelFavorites;

