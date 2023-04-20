import { ACCOUNT_SYNC } from 'src/constants';
import useLocalStorage from './useLocalStorage'
import { useUI } from '@contexts/ui-context';
import { useEffect } from 'react';
import { useAuthentication } from '@contexts/authentication-context';
// import { NetworkStatus } from './useCmix';
import { useNetworkClient } from '@contexts/network-client-context';

export enum AccountSyncStatus {
  NotSynced = 'NotSynced',
  Synced = 'Synced',
  Ignore = 'Ignored'
}

export enum AccountSyncService {
  None = 'None',
  Google = 'Google',
  Dropbox = 'Dropbox'
}

const useAccountSync = () => {
  const { networkStatus } = useNetworkClient();
  const { isAuthenticated } = useAuthentication();
  const { openModal, setModalView } = useUI();
  const [status] = useLocalStorage(ACCOUNT_SYNC, AccountSyncStatus.NotSynced);

  useEffect(() => {
    // Uncomment to reenable account sync modal
    // if (networkStatus === NetworkStatus.CONNECTED && isAuthenticated && status === AccountSyncStatus.NotSynced) {
    //   setModalView('ACCOUNT_SYNC');
    //   openModal()
    // }
  }, [isAuthenticated, networkStatus, openModal, setModalView, status]);
}

export default useAccountSync;
