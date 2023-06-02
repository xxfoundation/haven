import useGoogleRemoteStore from './useGoogleRemoteStore';
import useDropboxRemoteStore from './useDropboxRemoteStore';
import { useEffect } from 'react';
import { AppEvents, bus } from 'src/events';
import useAccountSync, { AccountSyncService, AccountSyncStatus } from './useAccountSync';
import { useNetworkClient } from '@contexts/network-client-context';

const useRemoteStore = () => {
  const googleStore = useGoogleRemoteStore();
  const dropboxStore = useDropboxRemoteStore();
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
  }, [cmix, setService, setStatus, dropboxStore, googleStore, status])

  return googleStore || dropboxStore;
}

export default useRemoteStore;