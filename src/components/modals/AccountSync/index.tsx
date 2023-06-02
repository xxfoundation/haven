import { FC, useCallback, useState } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloud, faSync } from '@fortawesome/free-solid-svg-icons';

import { PrimaryButton, Spinner } from '@components/common';
import { useUI } from '@contexts/ui-context';
import useAccountSync, { AccountSyncStatus } from 'src/hooks/useAccountSync';
import GoogleButton from '../../common/GoogleButton';
import DropboxButton from '../../common/DropboxButton';

import s from './styles.module.scss';
import { AppEvents, awaitEvent } from 'src/events';

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
    <div
      data-testid='account-sync-modal'
      className={cn('w-full flex flex-col justify-center items-center text-center space-y-4', s.root)}
    >
      <div className='flex flex-col justify-center items-center'>
        <h2>
          {t('Account Sync')}
        </h2>
        <div className={s.iconStack}>
          <FontAwesomeIcon icon={faCloud} size='3x' />
          <FontAwesomeIcon className='pt-1' icon={faSync} size='2x' color='var(--cyan)'/>
        </div>
      </div>
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
        <div data-testid='account-sync-buttons' className='space-x-6 space-y-4'>
          <GoogleButton onStartLoading={waitForRemoteSyncThenClose} />
          <DropboxButton onStartLoading={waitForRemoteSyncThenClose} />
          <PrimaryButton
            data-testid='account-sync-local-only-button'
            onClick={ignoreSync}
          >
            {t('Local-only')}
          </PrimaryButton>
        </div>
      )}
    </div>
  )
}

export default AccountSyncView;