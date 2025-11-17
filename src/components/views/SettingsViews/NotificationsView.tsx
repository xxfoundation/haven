import CheckboxToggle from '@components/common/CheckboxToggle';
import NotificationSoundSelector from '@components/common/NotificationSoundSelector';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useNotification from 'src/hooks/useNotification';

const NotificationsView = () => {
  const { t } = useTranslation();
  const { isPermissionGranted, request, setIsPermissionGranted, enableSounds, setEnableSounds } = useNotification();
  const [showDeniedWarning, setShowDeniedWarning] = useState(false);

  const onNotificationsChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        // Request permission
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setIsPermissionGranted(true);
          setShowDeniedWarning(false);
        } else {
          // Permission denied or default (user dismissed)
          setIsPermissionGranted(false);
          setShowDeniedWarning(true);
        }
      } else {
        // User disabling notifications
        setIsPermissionGranted(false);
        setShowDeniedWarning(false);
      }
    },
    [setIsPermissionGranted]
  );

  return (
    <>
      <h2>{t('Notifications')}</h2>
      <hr className='w-full my-10 border-charcoal-3' />
      <div className='space-y-4'>
        <div className='flex justify-between items-center'>
          <h3 className='headline--sm'>{t('Enable Browser Notifications')}</h3>
          <CheckboxToggle checked={isPermissionGranted} onChange={onNotificationsChange} />
        </div>
        {showDeniedWarning && (
          <p className='text-sm text-red-400'>
            {t('Notifications disabled in browser settings. Enable in browser to continue.')}
          </p>
        )}
        <div className='flex justify-between items-center'>
          <h3 className='headline--sm'>{t('Enable Notification Sounds')}</h3>
          <CheckboxToggle checked={enableSounds} onChange={(e) => setEnableSounds(e.target.checked)} />
        </div>
        {enableSounds && (
          <div className='flex justify-between items-center'>
            <h3 className='headline--sm'>{t('Notification Sound')}</h3>
            <NotificationSoundSelector />
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationsView;
