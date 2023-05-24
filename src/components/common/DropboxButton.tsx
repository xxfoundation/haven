import { DropboxAuth } from 'dropbox';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { faDropbox } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import { ModalCtaButton } from '@components/common';
import { AppEvents, bus } from 'src/events'
import { IModalCtaButtonProps } from './ModalCtaButton/ModalCtaButton';
import useDropboxRemoteStore from 'src/hooks/useDropboxRemoteStore';
import { useNetworkClient } from '@contexts/network-client-context';

type Props = Partial<IModalCtaButtonProps> & {
  onSync?: () => void;
  onError?: () => void;
  password?: string;
}

const DropboxButton: FC<Props> = ({
  password,
  onSync = () => {},
  onError = () => {},
  ...props
}) => {
  const remoteStore = useDropboxRemoteStore();
  const { decryptPassword, loadCmix, setRemoteStore } = useNetworkClient();

  const { t } = useTranslation();

  const auth = useMemo(() => new DropboxAuth({
    clientId: process.env.NEXT_PUBLIC_APP_DROPBOX_CLIENT_ID,
  }), []);

  useEffect(() => {
    const onTokenMessage = (e: MessageEvent) => {
      if (window.location.origin === e.origin && e.data.code) {
        bus.emit(AppEvents.DROPBOX_TOKEN, e.data.code);
      }
    }

    window.addEventListener('message', onTokenMessage, false);

    return () => window.removeEventListener('message', onTokenMessage)
  }, []);

  const handleSuccessfulLogin = useCallback(async () => {
    try {
      await loadCmix(decryptPassword(password));
      onSync();
    } catch (e) {
      onError();
    }
  }, [decryptPassword, loadCmix, onError, onSync, password])

  useEffect(() => {
    if (remoteStore) {
      setRemoteStore(remoteStore);
      handleSuccessfulLogin();
    }
  }, [handleSuccessfulLogin, remoteStore, setRemoteStore]);

    
  const onClick = useCallback(async () => {
    const redirectUrl = new URL(window.location.href);
    redirectUrl.pathname = 'dropbox';
    const url = (await auth.getAuthenticationUrl(redirectUrl.href, undefined, 'token')).toString();
    window.open(url, '_blank', 'width=600,height=700');
  }, [auth]);


  return (
    <ModalCtaButton
      {...props}
      onClick={onClick}
      buttonCopy={<>
      <FontAwesomeIcon icon={faDropbox} />
      &nbsp;
        {t('Dropbox')}
      </>}
    />
  )
}

export default DropboxButton;
