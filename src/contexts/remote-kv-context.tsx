import { createContext, useEffect, useState, FC, useCallback, useContext } from 'react';
import assert from 'assert';
import { JsonDecoder } from 'ts.data.json'

import { makeDecoder } from 'src/utils/decoders'
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
    const entry = kvEntryDecoder(await this.kv.Get(key, KV_VERSION));
    return Buffer.from(entry.data, 'base64').toString();
  }

  set(key: string, data: string) {
    const entry = { Version: KV_VERSION, Data: Buffer.from(data).toString('base64'), Timestamp: new Date().toISOString() }
    return this.kv.Set(key, encoder.encode(JSON.stringify(entry)));
  }

  delete(key: string) {
    this.kv.Delete(key, KV_VERSION);
  }

  listenOn(key: string, onChange: OnChangeCallback) {
    this.kv.ListenOnRemoteKey(
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
      setLoading(true);
      kv.get(key).then((v) => {
        setValue(decoder(v));
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [decoder, key, kv]);

  useEffect(() => {
    if (kv) {
      kv.listenOn(key, (v) => {
        setValue(decoder(v));
      })
    }
  }, [decoder, key, kv]);

  const set = useCallback((v: T | ((v: T) => void)) => {
    assert(kv, `Attempted to set value on key ${key} but the store wasn't initialized`);
    return kv.set(key, JSON.stringify(v));
  }, [key, kv])

  return {
    loading: kv === undefined || loading,
    value,
    set
  }
}

const stringArrayDecoder = makeDecoder(JsonDecoder.array<string>(JsonDecoder.string, 'ChannelFavoritesDecoder'))

const useChannelFavorites = (kv?: RemoteKVWrapper) => {
  const { loading, set, value: favorites = [] } = useRemotelySynchedValue(kv, 'channel-favorites', stringArrayDecoder);

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

