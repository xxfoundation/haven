import { Decoder, makeDecoder } from '@utils/decoders';

import { useCallback, useEffect, useState } from 'react';
import assert from 'assert';

import { useRemoteKV } from 'src/contexts/remote-kv-context';
import { JsonDecoder } from 'ts.data.json';

const useRemotelySynchedValue = <T,>(key: string, decoder: Decoder<T>, defaultValue?: T) => {
  const [value, setValue] = useState<T | undefined>(defaultValue);
  const [loading, setLoading] = useState<boolean>(false);
  const kv = useRemoteKV();
  
  useEffect(() => {
    if (kv) {
      const id = kv.listenOn(key, (v) => {
        setValue(v !== undefined ? decoder(v) : v);
      });

      return () => { kv.unregisterListener(key, id); }
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
