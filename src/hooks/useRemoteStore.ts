import { useEffect } from 'react';
// import assert from 'assert';

import useGoogleRemoteStore from './useGoogleRemoteStore';
import useDropboxRemoteStore from './useDropboxRemoteStore';
import { AppEvents, bus } from 'src/events';
import useAccountSync, { AccountSyncService, AccountSyncStatus } from './useAccountSync';
import { useNetworkClient } from '@contexts/network-client-context';
// import { decoder, encoder } from '@utils/index';

const useRemoteStore = () => {
  const googleStore = useGoogleRemoteStore();
  const dropboxStore = useDropboxRemoteStore();
  const remoteStore = googleStore || dropboxStore;
  const { setService, setStatus, status } = useAccountSync();
  const { cmix } = useNetworkClient();

  useEffect(() => {
    if (googleStore && dropboxStore) {
      throw new Error('App is confused. Multiple remote stores detected');
    }
  }, [dropboxStore, googleStore]);

  useEffect(() => {
    if (status !== AccountSyncStatus.Synced && googleStore || dropboxStore) {
      setStatus(AccountSyncStatus.Synced);
      setService(
        googleStore
          ? AccountSyncService.Google
          : AccountSyncService.Dropbox
      )
      bus.emit(AppEvents.REMOTE_STORE_INITIALIZED);
    }
  }, [cmix, setService, setStatus, dropboxStore, googleStore, status]);

  // Use this to test remote store
  // const testRemoteStore = useCallback(async () => {
  //   assert(remoteStore);
  //   await remoteStore.Write('test1', encoder.encode('test1'));
  //   await remoteStore.Write('/test/test2', encoder.encode('test2'));
  //   const result1 = decoder.decode(await remoteStore.Read('/test1') ?? new Uint8Array());
  //   assert(result1 === 'test1', 'Writing test1 failed');
  //   const result2 = decoder.decode(await remoteStore.Read('test/test2') ?? new Uint8Array());
  //   assert(result2 === 'test2', 'Writing test2 failed');
  //   const allFiles = JSON.parse(decoder.decode(await remoteStore.ReadDir('/'))) as string[];
  //   assert(allFiles.includes('test1') && !allFiles.includes('test2') && allFiles.includes('test'), 'Expected only test1 and test to be there');
  //   const onlyTest2Files = JSON.parse(decoder.decode(await remoteStore.ReadDir('test'))) as string[];
  //   assert(!onlyTest2Files.includes('test1') && onlyTest2Files.includes('test2') && !onlyTest2Files.includes('test'), 'Expected only test2 to be there');
  //   const lastModified = await remoteStore.GetLastModified('test1');
  //   assert(lastModified, 'Last modified didnt work');
  //   assert(remoteStore.GetLastWrite(), 'GetLastWrite failed');
  //   await remoteStore.Write('/test1', encoder.encode('testZ'));
  //   const result3 = decoder.decode(await remoteStore.Read('/test1') ?? new Uint8Array());
  //   assert(result3 === 'testZ', `Overwrite of test file test1 failed. Got ${result3}`);
  // }, [remoteStore]);

  // useEffect(() => {
  //   if (remoteStore) {
  //     testRemoteStore();
  //   }
  // }, [remoteStore, testRemoteStore])

  return remoteStore;
}

export default useRemoteStore;