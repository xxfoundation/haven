import { createContext, useEffect, useState, FC, useCallback, useContext } from 'react';
import assert from 'assert';

import { channelFavoritesDecoder } from 'src/utils/decoders'
import { KV_VERSION, OperationType, RemoteKV } from 'src/types/collective';
import { encoder } from 'src/utils/index';
import { Decoder, kvEntryDecoder } from 'src/utils/decoders';
import { WithChildren } from 'src/types';
import { NetworkStatus, useNetworkClient } from './network-client-context';

type OnChangeCallback = (data?: string) => void;

class RemoteKVWrapper {
  kv: RemoteKV;

  constructor(kv: RemoteKV) {
    this.kv = kv;
  }

  async get(key: string) {
    let value = undefined;
    try {
      const fetchedEntry = await this.kv.Get(key, KV_VERSION);
      const entry = kvEntryDecoder(fetchedEntry);
      value = Buffer.from(entry.data, 'base64').toString();
    } catch (e) {
      console.warn(`Could not find ${key} in remote kv, returning undefined. Remote kv returned ${(e as Error).message}`);
    }
    return value;
  }

  set(key: string, data: string) {
    const entry = { Version: KV_VERSION, Data: Buffer.from(data).toString('base64'), Timestamp: new Date().toISOString() }
    return this.kv.Set(key, encoder.encode(JSON.stringify(entry)));
  }

  delete(key: string) {
    this.kv.Delete(key, KV_VERSION);
  }

  listenOn(key: string, onChange: OnChangeCallback) {
    return this.kv.ListenOnRemoteKey(
      key,
      KV_VERSION,
      {
        Callback: (_k, _old, v, operationType) => {
          const entry = kvEntryDecoder(v);
          const converted = Buffer.from(entry.data, 'base64').toString();
          onChange(
            operationType === OperationType.Deleted
              ? undefined
              : converted
          );
        }
      }
    );
  }
}

export const useRemotelySynchedValue = <T,>(kv: RemoteKVWrapper | undefined, key: string, decoder: Decoder<T>) => {
  const [value, setValue] = useState<T>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (kv) {
      kv.listenOn(key, (v) => {
        setValue(v !== undefined ? decoder(v) : v);
      })
    }
  }, [decoder, key, kv]);

  useEffect(() => {
    if (kv) {
      setLoading(true);
      kv.get(key).then((v) => {
        setValue(v !== undefined ? decoder(v) : v);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [decoder, key, kv]);

  const set = useCallback(async (v: T) => {
    assert(kv, `Attempted to set value on key ${key} but the store wasn't initialized`);
    await kv.set(key, JSON.stringify(v));
    setValue(v); // TODO remove this when callback properly gets triggered.
  }, [key, kv])

  return {
    loading: kv === undefined || loading,
    value,
    set
  }
}

const useChannelFavorites = (kv?: RemoteKVWrapper) => {
  const { loading, set, value: favorites = [] } = useRemotelySynchedValue(kv, 'channel-favorites', channelFavoritesDecoder);

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
}


type ContextType = {
  kv?: RemoteKVWrapper,
  channelFavorites: ReturnType<typeof useChannelFavorites>;
}

const RemoteKVContext = createContext<ContextType>({} as ContextType);

export const RemoteKVProvider: FC<WithChildren> = ({ children }) => {
  const { cmix, networkStatus } = useNetworkClient();
  const [kv, setKv] = useState<RemoteKVWrapper>();

  useEffect(() => {
    if (cmix && networkStatus !== NetworkStatus.UNINITIALIZED) {
      cmix.GetRemoteKV().then((rawKv) => {
        setKv(new RemoteKVWrapper(rawKv));
      })
    }
  }, [cmix, networkStatus]);

  const channelFavorites = useChannelFavorites(kv);

  return (
    <RemoteKVContext.Provider value={{ channelFavorites, kv }}>
      {children}
    </RemoteKVContext.Provider>
  )
}

export const useRemoteKV = () => useContext(RemoteKVContext);

