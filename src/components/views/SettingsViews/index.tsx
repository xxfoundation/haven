import type { SettingsView } from 'src/types/ui';

import { FC } from 'react';

import { useUI } from '@contexts/ui-context';
import DoubleLeftArrows from '@components/icons/DoubleLeftArrows';

import ExportCodenameView from './ExportCodename';
import NotificationsView from './NotificationsView';
import DeveloperOptionsView from './DeveloperOptions';
import LogOutView from './LogOut';

const NOOP = () => null;

const views: Partial<Record<SettingsView, FC>> = {
  notifications: NotificationsView,
  logout: LogOutView,
  'export-codename': ExportCodenameView,
  dev: DeveloperOptionsView
};

const Settings = () => {
  const { settingsView } = useUI();

  const handleBackClick = () => {
    const mobileToggle = document.getElementById('mobileToggle') as HTMLInputElement;
    if (mobileToggle) {
      mobileToggle.checked = false;
    }
  };

  const View = views[settingsView] ?? NOOP;
  return (
    <div className='bg-near-black py-12 px-10 w-full max-w-4xl'>
      {/* Back button for mobile - only visible on screens < md (768px) */}
      <button
        onClick={handleBackClick}
        className='md:hidden flex items-center space-x-2 mb-6 text-primary hover:opacity-80 transition-opacity'
        aria-label='Back to settings menu'
      >
        <DoubleLeftArrows className='w-4 h-4' />
        <span className='font-medium'>Back to Settings</span>
      </button>
      <View />
    </div>
  );
};

export default Settings;
