import { JsonDecoder } from 'ts.data.json';
import useRemotelySynchedValue from './useRemotelySynchedValue';
import { makeDecoder } from '@utils/decoders';

const KEY = 'channels-storage-tag';

const useStorageTag = () => {
  const result = useRemotelySynchedValue(KEY, makeDecoder(JsonDecoder.string));
  console.log('Ready storage tag value:', result.value);
  return result;
};

export default useStorageTag;
