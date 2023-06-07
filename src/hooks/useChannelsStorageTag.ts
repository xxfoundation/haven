import { JsonDecoder } from 'ts.data.json';
import useRemotelySynchedValue from './useRemotelySynchedValue';
import { makeDecoder } from '@utils/decoders';

const KEY = 'channels-storage-tag';

const useStorageTag = () => {
  return useRemotelySynchedValue(KEY, makeDecoder(JsonDecoder.string));
};

export default useStorageTag;
