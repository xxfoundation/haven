import { ACCOUNT_SYNC, ACCOUNT_SYNC_SERVICE } from 'src/constants';
import useLocalStorage from './useLocalStorage';

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
  const [status, setStatus] = useLocalStorage(ACCOUNT_SYNC, AccountSyncStatus.NotSynced);
  const [service, setService] = useLocalStorage(ACCOUNT_SYNC_SERVICE, AccountSyncService.None);

  return {
    status,
    setStatus,
    service,
    setService
  }
}

export default useAccountSync;
