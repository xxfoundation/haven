import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Spinner } from '@components/common';
import { useUI } from '@contexts/ui-context';
import useAccountSync, { AccountSyncStatus } from 'src/hooks/useAccountSync';
import GoogleButton from '../../common/GoogleButton';
import DropboxButton from '../../common/DropboxButton';

import { AppEvents, awaitAppEvent as awaitEvent } from 'src/events';
import ModalTitle from '../ModalTitle';

const AccountSyncView: FC = () => {
  const { t } = useTranslation();
  const { closeModal } = useUI();
  const { setStatus } = useAccountSync();
  const [loading, setLoading] = useState(false);

  const ignoreSync = useCallback(() => {
    setStatus(AccountSyncStatus.Ignore);
    closeModal();
  }, [closeModal, setStatus]);

  const waitForRemoteSyncThenClose = async () => {
    setLoading(true);
    await awaitEvent(AppEvents.REMOTE_STORE_INITIALIZED).finally(() => {
      setLoading(false);
    });
    closeModal();
  }

  return (
    <>
      <ModalTitle>
        {t('Account Sync')}
      </ModalTitle>
      <p>
        Sync your account with multiple devices using the cloud with account sync.
        The file is encrypted so there are no privacy concerns with using these
        third party services.
      </p>
      <p style={{ color: 'var(--orange)'}}>
        <strong>Warning!</strong> Once you choose a cloud provider you will
        not be able to change to another service or revert to local-only.
      </p>
      {loading ? <Spinner size='md' /> : (
        <div data-testid='account-sync-buttons' className='grid grid-cols-2 gap-4 pt-4'>
          <GoogleButton className='whitespace-nowrap' onStartLoading={waitForRemoteSyncThenClose} />
          <DropboxButton onStartLoading={waitForRemoteSyncThenClose} />
          <div className='col-span-2 text-center'>
            <Button
              className=''
              data-testid='account-sync-local-only-button'
              onClick={ignoreSync}
            >
              {t('Local-only')}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

export default AccountSyncView;