import { DropboxAuth } from 'dropbox';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { faDropbox } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';

import Button, { Props as ButtonProps } from '@components/common/Button';
import { AppEvents, appBus } from 'src/events'

type Props = Partial<ButtonProps> & {
  onStartLoading?: () => void;
  password?: string;
}

const DropboxButton: FC<Props> = ({
  onStartLoading = () => {},
  ...props
}) => {
  const { t } = useTranslation();

  const auth = useMemo(() => new DropboxAuth({
    clientId: process.env.NEXT_PUBLIC_APP_DROPBOX_CLIENT_ID,
  }), []);

  const onTokenMessage = useCallback((e: MessageEvent) => {
    if (window.location.origin === e.origin && e.data.code) {
      appBus.emit(AppEvents.DROPBOX_TOKEN, e.data.code);
      onStartLoading();
    }
  }, [onStartLoading]);

  useEffect(() => {
    window.addEventListener('message', onTokenMessage, false);

    return () => window.removeEventListener('message', onTokenMessage)
  }, [onStartLoading, onTokenMessage]);

  const onClick = useCallback(async () => {
    const redirectUrl = new URL(window.location.href);
    redirectUrl.pathname = 'dropbox';
    const url = (await auth.getAuthenticationUrl(redirectUrl.href, undefined, 'token')).toString();
    window.open(url, '_blank', 'width=600,height=700');
  }, [auth]);

  return (
    <Button
      {...props}
      className={cn('flex justify-center items-center space-x-1')}
      onClick={onClick}
    >
      <FontAwesomeIcon className='w-5 h-5' icon={faDropbox} />
      &nbsp;
      {t('Dropbox')}
    </Button>
  )
}

export default DropboxButton;
