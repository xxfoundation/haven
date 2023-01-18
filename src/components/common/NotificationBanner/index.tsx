import cn from 'classnames';

import useNotification from 'src/hooks/useNotification';
import { Close } from 'src/components/icons';

import s from './styles.module.scss';

const NotificationBanner = () => {
  const { isPermissionGranted, permissionIgnored, request, setPermissionIgnored } = useNotification();
  const showBanner = !isPermissionGranted && !permissionIgnored;

  return showBanner ? (
    <div className={cn(s.root, 'drop-shadow-xl')}>
      <span>
        Speakeasy uses desktop notifications. <button onClick={request}>Enable?</button>
      </span>
      <Close
        onClick={() => setPermissionIgnored(true)}
        aria-label='Close panel'
        className={s.close}
      />
    </div>
  ) : null;
}

export default NotificationBanner;
