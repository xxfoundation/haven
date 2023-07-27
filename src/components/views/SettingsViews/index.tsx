import type { SettingsView } from 'src/types/ui';

import { FC } from 'react';

import { useUI } from '@contexts/ui-context';

import ExportCodenameView from './ExportCodename';
import NotificationsView from './NotificationsView';
import DeveloperOptionsView from './DeveloperOptions';
import LogOutView from './LogOut';
import AccountSync from './AccountSync';


const NOOP = () => null;

const views: Partial<Record<SettingsView, FC>> = {
  'account-sync': AccountSync,
  notifications: NotificationsView,
  logout: LogOutView,
  'export-codename': ExportCodenameView,
  'dev': DeveloperOptionsView
}

const Settings = () => {
  const { settingsView } = useUI();

  const View = views[settingsView] ?? NOOP;
  return (
    <div className='bg-near-black py-12 px-10 w-full max-w-4xl'>
      <View />
    </div>
  )
}

export default Settings;
