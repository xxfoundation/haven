import React, { FC, useCallback } from 'react';
import s from './SettingsView.module.scss';
import { Download, Export, Logout } from 'src/components/icons';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import { useUI } from 'src/contexts/ui-context';
import CheckboxToggle from 'src/components/common/CheckboxToggle';
import useNotification from 'src/hooks/useNotification';
import useTrackNetworkPeriod from 'src/hooks/useNetworkTrackPeriod';

const SettingsView: FC = () => {
  const { toggle: toggleTrackingMode, trackingMode } = useTrackNetworkPeriod();
  const { t } = useTranslation();
  const { openModal, setModalView } = useUI();
  const { isPermissionGranted, request, setIsPermissionGranted } = useNotification();

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
  }, [request, setIsPermissionGranted])

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
