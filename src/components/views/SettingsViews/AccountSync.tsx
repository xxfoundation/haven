import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Spinner } from '@components/common';
import { useUI } from '@contexts/ui-context';
import GoogleButton from '@components/common/GoogleButton';
import DropboxButton from '@components/common/DropboxButton';
import useAccountSync, { AccountSyncService } from 'src/hooks/useAccountSync';
import { AppEvents, awaitAppEvent } from 'src/events';
import Badge from '@components/common/Badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDropbox, faGoogleDrive } from '@fortawesome/free-brands-svg-icons';

const AccountSync = () => {
  const { t } = useTranslation();
  const { alert } = useUI();
  const [loading, setLoading] = useState(false);
  const { isSynced, service } = useAccountSync();

  const onSyncStart = async () => {
    setLoading(true);
    await awaitAppEvent(AppEvents.REMOTE_STORE_INITIALIZED).finally(() => {
      alert({ type: 'success', content: t('Account successfully synced!' )})
      setLoading(false);
    });
  }

  return (
    <>
      <h2>{t('Account Sync')}</h2>
      <hr className='w-full my-10 border-charcoal-3' />
      <div className='space-y-10'>
        <p>
          {t(`
            Sync your account with multiple devices using the cloud with account sync.
            All files stored are encrypted so there are no privacy concerns with using these
            third party services.
          `)}
        </p>
        <div className='flex justify-between items-center'>
          <h3 className='headline--sm'>{t('Status')}</h3>
          <Badge color='gold' className='text-[0.875rem] p-2 tracking-normal rounded-lg'>
            {isSynced ? t('Synced') : t('Not synced')}
          </Badge>
        </div>
        {isSynced && (
          <div className='flex justify-between items-center'>
            <h3 className='headline--sm'>{t('Service')}</h3>
            <Badge color='gold' className='text-[0.875rem] p-2 flex space-x-2 tracking-normal rounded-lg'>
              {service === AccountSyncService.Google && (<>
                <FontAwesomeIcon className='w-5 h-5' icon={faGoogleDrive} />
                <span>Google Drive</span>
              </>)}
              {service === AccountSyncService.Dropbox && (<>
                <FontAwesomeIcon className='w-5 h-5' icon={faDropbox} />
                <span>Dropbox</span>
              </>)}
            </Badge>
          </div>
        )}
        {!isSynced && (
          <>
            <p style={{ color: 'var(--orange)'}}>
              <Trans t={t}>
                <strong>Warning!</strong> Once you choose a cloud provider you will
                not be able to change to another service or revert to local-only.
              </Trans>
            </p>
            {loading ? <Spinner size='md' /> : (
              <div data-testid='account-sync-buttons' className='space-x-6 flex items-center'>
                <GoogleButton onStartLoading={onSyncStart} />
                <DropboxButton onStartLoading={onSyncStart} />
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default AccountSync;
