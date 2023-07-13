import type { SettingsView } from 'src/types/ui';

import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useUI } from '@contexts/ui-context';
import useNotification from 'src/hooks/useNotification';
import CheckboxToggle from '@components/common/CheckboxToggle';
import Input from '@components/common/Input';
import { useNetworkClient } from '@contexts/network-client-context';
import useInput from 'src/hooks/useInput';
import { Button } from '@components/common';

const NotificationsView = () => {
  const { t } = useTranslation();
  const { isPermissionGranted, request, setIsPermissionGranted } = useNotification();
  const onNotificationsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      request();
    } else {
      setIsPermissionGranted(false);
    }
  }, [request, setIsPermissionGranted]);

  return (
    <>
      <h2>{t('Notifications')}</h2>
      <hr className='w-full my-10 border-charcoal-3' />
      <div className='flex justify-between'>
        <h3 className='headline--sm'>
          {t('Enable Notifications')}
        </h3>
        <CheckboxToggle checked={isPermissionGranted} onChange={onNotificationsChange} />
      </div>
    </>
  )
}

const LogOutView = () => {
  const { t } = useTranslation();
  const { logout } = useNetworkClient();
  const [password, setPassword] = useInput('');
  return (
    <>
      <h2>{t('Log out')}</h2>
      <hr className='w-full my-10 border-charcoal-3' />
      <p className='text-orange text-sm font-weight-normal leading-5'>
        {t('Warning: By logging out, all of you current data will be deleted from your browser. Please make sure you have a backup first. This can\'t be undone.')}
      </p>
      <form className='space-y-8 mt-8' onSubmit={() => { logout(password) }}>
        <Input className='w-80 h-10' type='password' placeholder={t('Enter password')} onChange={setPassword} value={password} />
        <Button disabled={!password} type='submit'>
          {t('Log Out')}
        </Button>
      </form>
    </>
  )
}

const ExportCodenameView = () => {
  const { t } = useTranslation();
  const { alert } = useUI();
  const { exportPrivateIdentity } = useNetworkClient();
  const [password, setPassword, { set: setPassValue }] = useInput('');

  const handleSubmit = useCallback(async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (password.length) {
      const result = await exportPrivateIdentity(password);
      if (result) {
        alert({ type: 'success', content: 'Account exported successfully' });
        setPassValue('');
      } else {
        alert({ type: 'error', content: 'Incorrect password.' });
      }
    }
  }, [password, exportPrivateIdentity, alert, setPassValue]);

  return (
    <>
      <h2>{t('Export Codename')}</h2>
      <hr className='w-full my-10 border-charcoal-3' />
      <p className='text-sm font-weight-normal text-charcoal-1'>{t('You can export your codename for backup or to use your codename on a second device.')}</p>
      <form className='space-y-8 mt-8' onSubmit={handleSubmit}>
        <Input className='w-80 h-10' type='password' placeholder={t('Unlock export with your password')} onChange={setPassword} value={password} />
        <Button type='submit'>
          {t('Export')}
        </Button>
      </form>
    </>
  )
}

const NOOP = () => null;

const views: Partial<Record<SettingsView, FC>> = {
  'notifications': NotificationsView,
  'logout': LogOutView,
  'export-codename': ExportCodenameView
}

const Settings = () => {
  const { settingsView } = useUI();

  const View = views[settingsView] ?? NOOP;
  return (
    <div className='bg-near-black py-12 px-10'>
      <View />
    </div>
  )
}

export default Settings;
