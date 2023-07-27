import CheckboxToggle from '@components/common/CheckboxToggle';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useNotification from 'src/hooks/useNotification';

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
          {t('Enable Browser Notifications')}
        </h3>
        <CheckboxToggle checked={isPermissionGranted} onChange={onNotificationsChange} />
      </div>
    </>
  )
};

export default NotificationsView;
