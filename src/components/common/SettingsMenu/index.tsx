import { useTranslation } from 'react-i18next';
import cn from 'classnames';

import { useUI } from '@contexts/ui-context';
import { FC, HTMLAttributes, SVGProps, useCallback } from 'react';
import { Download } from '@components/icons';
import NotificationsIcon from '@components/icons/Notifications';
import ExportCodename from '@components/icons/ExportCodename';
import LogOut from '@components/icons/Logout';

type SettingsOptionProps = HTMLAttributes<HTMLButtonElement> & {
  icon: (props: SVGProps<SVGSVGElement>) => JSX.Element,
  active?: boolean;
}

const SettingsOption: FC<SettingsOptionProps> = ({ active, children, icon: Icon, ...props }) => (
  <button className={cn(
    'group p-4 flex items-center space-x-2 rounded-xl hover:bg-charcoal-4 w-full',
    active && 'bg-charcoal-4'
  )} {...props}>
    <Icon className={cn('group-hover:text-primary', active ? 'text-primary' : 'text-charcoal-1 ')} />
    <span className=''>
      {children}
    </span>
  </button>
)

const SettingsMenu = () => {
  const { t } = useTranslation();
  const { setSettingsView, settingsView } = useUI();

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

  return (
    <div className='pt-4 px-4 space-y-1'>
      <SettingsOption
        active={settingsView === 'notifications'}
        icon={NotificationsIcon}
        onClick={() => setSettingsView('notifications')}
      >
          {t('Notifications')}
      </SettingsOption>
      <SettingsOption
        active={false}
        icon={Download}
        onClick={exportLogs}
      >
        {t('Download Logs')}
      </SettingsOption>
      <SettingsOption
        active={settingsView === 'export-codename'}
        icon={ExportCodename}
        onClick={() => setSettingsView('export-codename')}
      >
          {t('Export Codename')}
      </SettingsOption>
      <SettingsOption
        active={settingsView === 'logout'}
        icon={LogOut}
        onClick={() => setSettingsView('logout')}
      >
          {t('Log Out')}
      </SettingsOption>
    </div>
  )
}

export default SettingsMenu;
