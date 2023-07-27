import { useTranslation } from 'react-i18next';
import cn from 'classnames';

import { useUI } from '@contexts/ui-context';
import { FC, HTMLAttributes, SVGProps } from 'react';
import NotificationsIcon from '@components/icons/Notifications';
import ExportCodename from '@components/icons/ExportCodename';
import LogOut from '@components/icons/Logout';
import useIsDev from 'src/hooks/useIsDev';
import Dev from '@components/icons/Dev';
import Sync from '@components/icons/Sync';

type SettingsOptionProps = HTMLAttributes<HTMLButtonElement> & {
  icon: (props: SVGProps<SVGSVGElement>) => JSX.Element,
  active?: boolean;
}

const SettingsOption: FC<SettingsOptionProps> = ({ active,  children, icon: Icon, ...props }) => (
  <button className={cn(
    'group p-4 flex items-center space-x-2 rounded-xl hover:bg-charcoal-4 w-full',
    active && 'bg-charcoal-4'
  )} {...props}>
    <Icon className={cn('w-8 h-8 group-hover:text-primary', active ? 'text-primary' : 'text-charcoal-1 ')} />
    <span className='font-medium'>
      {children}
    </span>
  </button>
)

const SettingsMenu = () => {
  const { t } = useTranslation();
  const { setSettingsView, settingsView } = useUI();
  const isDev = useIsDev();

  return (
    <div className='pt-4 px-4 space-y-1'>
      <SettingsOption
        active={settingsView === 'account-sync'}
        icon={Sync}
        onClick={() => setSettingsView('account-sync')}
      >
        {t('Account Sync')}
      </SettingsOption>
      <SettingsOption
        active={settingsView === 'notifications'}
        icon={NotificationsIcon}
        onClick={() => setSettingsView('notifications')}
      >
        {t('Notifications')}
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
      {isDev && (
        <SettingsOption
          active={settingsView === 'dev'}
          icon={Dev}
          onClick={() => setSettingsView('dev')}
        >
          {t('Developer Options')}
        </SettingsOption>
      )}
    </div>
  )
}

export default SettingsMenu;
