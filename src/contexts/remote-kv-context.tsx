import { createContext, useEffect, useState, FC, useContext, useCallback } from 'react';
import assert from 'assert';

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
    this.kv.ListenOnRemoteKey(key, KV_VERSION, (_k, _old, v, operationType) => {
      if (operationType !== OperationType.Deleted) {
        const entry = kvEntryDecoder(v);
        onChange(Buffer.from(entry.data, 'base64').toString());
      } else {
        onChange(undefined);
      }
    });
  }
}

const RemoteKVContext = createContext<{ kv?: RemoteKVWrapper }>({});

export const RemoteKVProvider: FC<WithChildren> = ({ children }) => {
  const { cmix, networkStatus } = useNetworkClient();
  const [kv, setKv] = useState<RemoteKVWrapper>();

  useEffect(() => {
    if (cmix && networkStatus !== NetworkStatus.UNINITIALIZED) {
      cmix.GetRemoteKV().then((rawKv) => {
        setKv(new RemoteKVWrapper(rawKv));
      })
    }
  }, [cmix, networkStatus])

  return (
    <RemoteKVContext.Provider value={{ kv }}>
      {children}
    </RemoteKVContext.Provider>
  )
}

const useRemoteKv = () => useContext(RemoteKVContext).kv;

export const useRemotelySynchedValue = <T,>(key: string, decoder: Decoder<T>) => {
  const [value, setValue] = useState<T>();
  const kv = useRemoteKv();
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

  const set = useCallback((v: T) => {
    assert(kv, `Attempted to set value on key ${key} but the store wasn't initialized`);
    return kv.set(key, JSON.stringify(v));
  }, [key, kv])

  return {
    loading: kv === undefined || loading,
    value,
    set
  }
}

