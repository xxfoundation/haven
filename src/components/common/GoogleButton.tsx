/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useCallback, useEffect } from 'react';
import { ModalCtaButton } from '@components/common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogleDrive } from '@fortawesome/free-brands-svg-icons';
import { useTranslation } from 'react-i18next';
import { useGoogleLogin } from '@react-oauth/google';
import useGoogleRemoteStore from 'src/hooks/useGoogleRemoteStore';
import { bus } from 'src/events';
import { useNetworkClient } from '@contexts/network-client-context';
import { IModalCtaButtonProps } from './ModalCtaButton/ModalCtaButton';

declare global {
  interface Window {
    google: any;
  }
}

type Props = Partial<IModalCtaButtonProps> & {
  onSync?: () => void;
  onError?: () => void;
  password?: string;
}

const GoogleButton: FC<Props>  = ({
  password,
  onSync = () => {},
  onError = () => {},
  ...props
}) => {
  const { t } = useTranslation();
  const remoteStore = useGoogleRemoteStore();
  const { decryptPassword, loadCmix, setRemoteStore } = useNetworkClient();

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/drive.appdata',
    prompt: 'consent',
    onSuccess: (token) => {
      bus.emit('google-token', token.access_token)
    },
  });

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

  return (
    <ModalCtaButton
      {...props}
      id='google-auth-button'
      onClick={() => login()}
      buttonCopy={
        <>
          <FontAwesomeIcon icon={faGoogleDrive} />
          &nbsp;
          {t('Google Drive')}
        </>
      }
      
    />
  );
}

export default GoogleButton;
