import cn from 'classnames';

import useNotification from 'src/hooks/useNotification';
import { Close } from 'src/components/icons';
import { useTranslation } from 'react-i18next';

import s from './styles.module.scss';

const NotificationBanner = () => {
  const { t } = useTranslation();
  const { isPermissionGranted, permissionIgnored, request, setPermissionIgnored } = useNotification();
  const showBanner = !isPermissionGranted && !permissionIgnored;

  return showBanner ? (
    <div className={cn(s.root, 'drop-shadow-xl')}>
      <span>
        {t('Speakeasy uses desktop notifications.')}
        &nbsp;
        <button 
          aria-label={t('Enable desktop notifications')}
          onClick={request}>
          {t('Enable?')}
        </button>
      </span>
      <Close
        onClick={() => setPermissionIgnored(true)}
        aria-label={t('Close panel')}
        className={s.close}
      />
    </div>
  ) : null;
}

export default NotificationBanner;
