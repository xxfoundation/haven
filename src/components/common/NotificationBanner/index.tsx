import { useTranslation } from 'react-i18next';
import useNotification from 'src/hooks/useNotification';
import Close from 'src/components/icons/X';

const NotificationBanner = () => {
  const { t } = useTranslation();
  const { isPermissionGranted, permissionIgnored, request, setPermissionIgnored } =
    useNotification();
  const showBanner = !isPermissionGranted && !permissionIgnored;

  return showBanner ? (
    <div
      className='
      absolute top-0 left-0 w-full
      px-[60px] py-2
      bg-near-black
      flex justify-between
      drop-shadow-xl
      z-10
    '
    >
      <span className='block w-full max-w-[1440px] mx-auto'>
        {t('Haven uses desktop notifications.')}
        &nbsp;
        <button
          className='text-[var(--primary)]'
          aria-label={t('Enable desktop notifications')}
          onClick={request}
        >
          {t('Enable?')}
        </button>
      </span>
      <Close
        data-testid='close-notification-banner-button'
        onClick={() => setPermissionIgnored(true)}
        aria-label={t('Close panel')}
        className='w-6 h-6 cursor-pointer [&_path]:fill-[var(--primary)] [&_path]:stroke-2'
      />
    </div>
  ) : null;
};

export default NotificationBanner;
