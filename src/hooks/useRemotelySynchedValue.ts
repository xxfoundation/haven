import { Decoder, makeDecoder } from '@utils/decoders';

import { useCallback, useEffect, useState } from 'react';
import assert from 'assert';

import { useRemoteKV } from 'src/contexts/remote-kv-context';
import { JsonDecoder } from 'ts.data.json';
import { AppEvents, awaitEvent } from 'src/events';

const useRemotelySynchedValue = <T,>(key: string, decoder: Decoder<T>, defaultValue?: T) => {
  const [value, setValue] = useState<T | undefined>(defaultValue);
  const [loading, setLoading] = useState<boolean>(false);
  const kv = useRemoteKV();
  
  useEffect(() => {
    if (kv) {
      kv.listenOn(key, (v) => {
        console.log('KV: Onchange for key', key, 'value:', v);
        setValue(v !== undefined ? decoder(v) : v);
      })
    }
  }, [decoder, key, kv]);

  useEffect(() => {
    if (kv) {
      setLoading(true);
      kv.get(key).then((v) => {

        console.log('KV: Getting value for key', key, ', value:', v);
        setValue(v !== undefined ? decoder(v) : v);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [decoder, key, kv]);

  const set = useCallback(async (v: T) => {
    console.log('KV: setting value for key', key, 'value', v);
    let loadedKv = kv;
    if (!loadedKv) {
      const [awaitedKv] = await awaitEvent(AppEvents.REMOTE_KV_INITIALIZED) ?? [];
      loadedKv = awaitedKv;
    }
    assert(loadedKv, `Attempted to set value on key ${key} but the store wasn't initialized`);
    await loadedKv.set(key, JSON.stringify(v));
    setValue(v); // TODO remove this when callback properly gets triggered.
  }, [key, kv])

  return {
    loading: kv === undefined || loading,
    value,
    set
  }
}

const stringDecoder = makeDecoder(JsonDecoder.string);

export const useRemotelySynchedString = (key: string, defaultValue?: string) => useRemotelySynchedValue(key, stringDecoder, defaultValue);

export default useRemotelySynchedValue;
