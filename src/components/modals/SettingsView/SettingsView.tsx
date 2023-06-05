import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import s from './SettingsView.module.scss';
import { Download, Export, Logout } from 'src/components/icons';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import { useUI } from 'src/contexts/ui-context';
import CheckboxToggle from 'src/components/common/CheckboxToggle';
import useNotification from 'src/hooks/useNotification';
import useTrackNetworkPeriod from 'src/hooks/useNetworkTrackPeriod';
import useAccountSync, { AccountSyncService, AccountSyncStatus } from 'src/hooks/useAccountSync';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRadiation, faSync } from '@fortawesome/free-solid-svg-icons';
import Badge from '@components/common/Badge';
import { decoder, envIsDev } from '@utils/index';
import { useNetworkClient } from '@contexts/network-client-context';
import { PrimaryButton, Spinner } from '@components/common';

const SettingsView: FC = () => {
  const { toggle: toggleTrackingMode, trackingMode } = useTrackNetworkPeriod();
  const { t } = useTranslation();
  const { openModal, setModalView } = useUI();
  const { remoteStore } = useNetworkClient();
  const { isPermissionGranted, request, setIsPermissionGranted } = useNotification();
  const accountSync = useAccountSync();
  const isDev = useMemo(() => envIsDev(), []);
  const [currentFiles, setCurrentFiles] = useState<string>();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const printCurrentFiles = useCallback(
    async (folder = '') => {
      setDeleteLoading(true);
      try {
        await remoteStore?.ReadDir(folder)
          .then((v) => setCurrentFiles(decoder.decode(v)));
      } catch (e) {
        console.error('Deleting remote store failed', e);
      }
      setDeleteLoading(false);
    },
    [remoteStore]
  );

  const nukeRemoteStore = useCallback(async () => {
    setDeleteLoading(true);
    try {
      await remoteStore?.DeleteAll();
      await printCurrentFiles();
    } catch (e) {
      console.error('Delete failed', e);
    }
    setDeleteLoading(false);
  }, [printCurrentFiles, remoteStore]);

  useEffect(() => {
    if (isDev && remoteStore) {
      printCurrentFiles();
    }
  }, [isDev, printCurrentFiles, remoteStore])

  const exportLogs = useCallback(async () => {
    if (!window.logger) {
      throw new Error(t('Log file required'));
    }

    const filename = 'xxdk.log';
    const data = await window.logger.GetFile();
    const file = new Blob([data], { type: 'text/plain' });
    const a = document.createElement('a'),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }, [t]);

  const onNotificationsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      request();
    } else {
      setIsPermissionGranted(false);
    }
  }, [request, setIsPermissionGranted]);

  const notSynced = accountSync.status === null
    || [AccountSyncStatus.NotSynced, AccountSyncStatus.Ignore]
      .includes(accountSync.status)

  return (
    <div
      className={cn('w-full flex flex-col justify-center items-center', s.root)}
    >
      <h2 className='mt-9 mb-8'>
        {t('Settings')}
      </h2>
      <div className={s.wrapper}>
        <div>
          <h3 className='headline--sm'>
            {t('Notifications')}
          </h3>
          <CheckboxToggle checked={isPermissionGranted} onChange={onNotificationsChange} />
        </div>
        <div>
          <h3 className='headline--sm'>
            {t('Slow mode')}
          </h3>
          <CheckboxToggle checked={trackingMode === 'slow'} onChange={toggleTrackingMode} />
        </div>
        <div>
          <h3 className='headline--sm'>
            {t('Download logs')}
          </h3>
          <Download
            onClick={exportLogs}
          />
        </div>
        <div>
          <h3 className='headline--sm'>
            {t('Export my codename')}
          </h3>
          <Export
            onClick={() => {
              setModalView('EXPORT_CODENAME');
              openModal();
            }}
          />
        </div>
        <div>
          <h3 className='headline--sm'>
            {t('Account Sync')}
          </h3>
          {notSynced ? (
            <FontAwesomeIcon size='2x' style={{ color: 'var(--orange)' }} onClick={() => {
              setModalView('ACCOUNT_SYNC');
              openModal();
            }} className='pt-1' icon={faSync} />
          ) : (
            <>
              {accountSync.service === AccountSyncService.Dropbox && (
                <Badge style={{ fontSize: 18, fontWeight: 'bold', paddingLeft: '1rem', paddingRight: '1rem', marginRight: 0 }} color='gold'>
                  Dropbox
                </Badge>
              )}
              {accountSync.service === AccountSyncService.Google && (
                <Badge style={{ fontSize: 18, fontWeight: 'bold', paddingLeft: '1rem', paddingRight: '1rem', marginRight: 0 }} color='gold'>
                  Google
                </Badge>
              )}
            </>
          )}
        </div>
        {isDev && (
          <>
            <div>
              <h3 className='headline--sm'>
                {t('Remote Store')}
              </h3>
              <div>
                {notSynced
                  ? t('Not synced')
                  : (
                    <PrimaryButton size='sm' style={{ padding: '0.5rem 1rem' }} onClick={nukeRemoteStore}>
                      <FontAwesomeIcon icon={faRadiation} /> {t('Nuke')} <FontAwesomeIcon icon={faRadiation} />
                    </PrimaryButton>
                  )
                }
              </div>
            </div>
            <div className='block'>
              {deleteLoading ? <Spinner size='md' /> : (
                <code style={{ maxHeight: '10rem', overflow: 'scroll' }}>
                  {t('Current Remote Store Files')}
                  <br />
                  {currentFiles}
                </code>
              )}
            </div>
          </>
        )}
        <div>
          <h3 className='headline--sm'>
            {t('Logout')}
          </h3>
          <Logout
            onClick={() => {
              setModalView('LOGOUT');
              openModal();
            }}
          />
        </div>
      </div>

      <div className={s.links}>
        <a
          href='https://www.speakeasy.tech/how-it-works/'
          target='_blank'
          rel='noopener noreferrer'
        >
          {t('About')}
        </a>
        |
        <a
          href='https://www.speakeasy.tech/roadmap/'
          target='_blank'
          rel='noopener noreferrer'
        >
          {t('Roadmap')}
        </a>
        |
        <a href='https://xx.network/' target='_blank' rel='noopener noreferrer'>
          {t('xx network')}
        </a>
        |
        <a
          href='https://www.speakeasy.tech/privacy-policy/'
          target='_blank'
          rel='noopener noreferrer'
        >
          {t('Privacy Policy')}
        </a>
        |
        <a
          href='https://www.speakeasy.tech/terms-of-use/'
          target='_blank'
          rel='noopener noreferrer'
        >
          {t('Terms of Use')}
        </a>
      </div>
    </div>
  );
};

export default SettingsView;
