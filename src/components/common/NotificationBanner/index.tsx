import cn from 'classnames';

import useNotification from 'src/hooks/useNotification';
import Close from 'src/components/icons/X';
import { useTranslation } from 'react-i18next';

import s from './styles.module.scss';

const NotificationBanner = () => {
  const { t } = useTranslation();
  const { isPermissionGranted, permissionIgnored, request, setPermissionIgnored } = useNotification();
  const showBanner = !isPermissionGranted && !permissionIgnored;

  return showBanner ? (
    <div className={cn(s.root, 'drop-shadow-xl absolute bg-near-black flex justify-between z-10')}>
      <span>
        {t('Haven uses desktop notifications.')}
        &nbsp;
        <button 
          aria-label={t('Enable desktop notifications')}
          onClick={request}>
          {t('Enable?')}
        </button>
      </span>
      <Close
        data-testid='close-notification-banner-button'
        onClick={() => setPermissionIgnored(true)}
        aria-label={t('Close panel')}
        className={cn('w-6 h-6', s.close)}
      />
    </div>
  ) : null;
}

export default NotificationBanner;
