import { DropboxAuth } from 'dropbox';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { faDropbox } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import { PrimaryButton } from '@components/common';
import { AppEvents, bus } from 'src/events'
import { Props as ButtonProps } from './PrimaryButton/PrimaryButton';
import useDropboxRemoteStore from 'src/hooks/useDropboxRemoteStore';
import { useNetworkClient } from '@contexts/network-client-context';
import { RemoteStore } from '@types';

type Props = Partial<ButtonProps> & {
  onSync?: () => void;
  onError?: () => void;
  onStartLoading?: () => void;
  password?: string;
}

const DropboxButton: FC<Props> = ({
  password,
  onSync = () => {},
  onError = () => {},
  onStartLoading = () => {},
  ...props
}) => {
  const remoteStore = useDropboxRemoteStore();
  const { decryptPassword, loadCmix } = useNetworkClient();

  const { t } = useTranslation();

  const auth = useMemo(() => new DropboxAuth({
    clientId: process.env.NEXT_PUBLIC_APP_DROPBOX_CLIENT_ID,
  }), []);

  useEffect(() => {
    const onTokenMessage = (e: MessageEvent) => {
      if (window.location.origin === e.origin && e.data.code) {
        bus.emit(AppEvents.DROPBOX_TOKEN, e.data.code);
        onStartLoading();
      }
    }

    window.addEventListener('message', onTokenMessage, false);

    return () => window.removeEventListener('message', onTokenMessage)
  }, [onStartLoading]);

  const handleSuccessfulLogin = useCallback(async (store: RemoteStore) => {
    try {
      await loadCmix(decryptPassword(password), store);
      onSync();
    } catch (e) {
      onError();
    }
  }, [decryptPassword, loadCmix, onError, onSync, password])

  useEffect(() => {
    if (remoteStore) {
      handleSuccessfulLogin(remoteStore);
    }
  }, [handleSuccessfulLogin, remoteStore]);

    
  const onClick = useCallback(async () => {
    const redirectUrl = new URL(window.location.href);
    redirectUrl.pathname = 'dropbox';
    const url = (await auth.getAuthenticationUrl(redirectUrl.href, undefined, 'token')).toString();
    window.open(url, '_blank', 'width=600,height=700');
  }, [auth]);


  return (
    <PrimaryButton
      {...props}
      onClick={onClick}
    >
      <FontAwesomeIcon icon={faDropbox} />
      &nbsp;
      {t('Dropbox')}
    </PrimaryButton>
  )
}

export default DropboxButton;
