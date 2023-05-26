import { ACCOUNT_SYNC, ACCOUNT_SYNC_SERVICE } from 'src/constants';
import useLocalStorage from './useLocalStorage'
import { useUI } from '@contexts/ui-context';
import { useEffect } from 'react';
import { useAuthentication } from '@contexts/authentication-context';
import { NetworkStatus } from './useCmix';
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
  const [service] = useLocalStorage(ACCOUNT_SYNC_SERVICE, AccountSyncService.None);

  useEffect(() => {
    if (networkStatus === NetworkStatus.CONNECTED && isAuthenticated && status === AccountSyncStatus.NotSynced) {
      setModalView('ACCOUNT_SYNC', false);
      openModal()
    }
  }, [isAuthenticated, networkStatus, openModal, setModalView, status]);

  return {
    status,
    service
  }
}

export default useAccountSync;
