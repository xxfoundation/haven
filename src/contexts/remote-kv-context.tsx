import { createContext, useEffect, useState, FC, useContext } from 'react';

import { KV_VERSION, OperationType, RemoteKV, RemoteStore } from 'src/types/collective';
import { encoder } from 'src/utils/index';
import { kvEntryDecoder } from 'src/utils/decoders';
import { WithChildren } from 'src/types';
import { AppEvents, appBus as bus } from 'src/events';

type OnChangeCallback = (data?: string) => void;

export class RemoteKVWrapper {
  kv: RemoteKV;

  constructor(kv: RemoteKV) {
    this.kv = kv;
  }

  async get(key: string) {
    let value = undefined;
    try {
      const fetchedEntry = await this.kv.Get(key, KV_VERSION);
      const entry = kvEntryDecoder(fetchedEntry);
      if (entry) {
        value = Buffer.from(entry.data, 'base64').toString();
      }
    } catch (e) {
      console.warn(`Could not find ${key} in remote kv, returning undefined. Remote kv returned ${(e as Error).message}`);
    }
    return value;
  }

  set(key: string, data: string) {
    const entry = {
      Version: KV_VERSION,
      Data: Buffer.from(data).toString('base64'),
      Timestamp: new Date().toISOString()
    };
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
          const converted = entry ? Buffer.from(entry.data, 'base64').toString() : undefined;
          onChange(
            operationType === OperationType.Deleted
              ? undefined
              : converted
          );
        }
      }
    );
  }

  unregisterListener(key: string, id: number) {
    return this.kv.DeleteRemoteKeyListener(key, id);
  }
}

type ContextType = {
  kv?: RemoteKVWrapper,
  remoteStore?: RemoteStore,
  setRemoteStore: (store: RemoteStore | undefined) => void;
}

const RemoteKVContext = createContext<ContextType>({} as ContextType);

export const RemoteKVProvider: FC<WithChildren> = ({ children }) => {
  const [kv, setKv] = useState<RemoteKVWrapper>();
  const [remoteStore, setRemoteStore] = useState<RemoteStore>();
  
  useEffect(() => {
    bus.addListener(AppEvents.REMOTE_KV_INITIALIZED, setKv);

    return () => { bus.removeListener(AppEvents.REMOTE_KV_INITIALIZED, setKv); }
  }, []);

  useEffect(() => {
    if (remoteStore) {
      bus.emit(AppEvents.REMOTE_STORE_INITIALIZED, remoteStore);
    }
  }, [remoteStore]);

  useEffect(() => {
    const listener = () => {
      setRemoteStore(undefined);
    };
    bus.addListener(AppEvents.NEW_SYNC_CMIX_FAILED, listener);

    return () => { bus.removeListener(AppEvents.NEW_SYNC_CMIX_FAILED, listener) }
  }, [setRemoteStore]);

  return (
    <RemoteKVContext.Provider value={{ kv, remoteStore, setRemoteStore }}>
      {children}
    </RemoteKVContext.Provider>
  )
}

export const useRemoteKV = () => useContext(RemoteKVContext).kv;

export const useRemoteStore = () => {
  const { remoteStore, setRemoteStore } = useContext(RemoteKVContext);
  return [remoteStore, setRemoteStore] as [ContextType['remoteStore'], ContextType['setRemoteStore']];
}

