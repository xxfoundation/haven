import { JsonDecoder } from 'ts.data.json';
import useRemotelySynchedValue from './useRemotelySynchedValue';
import { makeDecoder } from '@utils/decoders';
import { useState } from 'react';

const KEY = 'channels-storage-tag';

const useStorageTag = () => {
  return {
    value: undefined,
    set: (a: string) => {},
    loading: false
  };
};

export default useStorageTag;
