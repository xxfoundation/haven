/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useCallback, useEffect } from 'react';
import { PrimaryButton } from 'src/components/common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogleDrive } from '@fortawesome/free-brands-svg-icons';
import { useTranslation } from 'react-i18next';
import { useGoogleLogin } from '@react-oauth/google';
import useGoogleRemoteStore from 'src/hooks/useGoogleRemoteStore';
import { AppEvents, bus } from 'src/events';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { Props as ButtonProps } from './PrimaryButton/PrimaryButton';
import { RemoteStore } from 'src/types';

declare global {
  interface Window {
    google: any;
  }
}

type Props = Partial<ButtonProps> & {
  onSync?: () => void;
  onError?: () => void;
  onStartLoading?: () => void;
  password?: string;
}

const GoogleButton: FC<Props>  = ({
  password,
  onSync = () => {},
  onError = () => {},
  onStartLoading = () => {},
  ...props
}) => {
  const { t } = useTranslation();
  const remoteStore = useGoogleRemoteStore();
  const { decryptPassword, loadCmix } = useNetworkClient();

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/drive.appdata',
    prompt: 'consent',
    onSuccess: (token) => {
      onStartLoading();
      bus.emit(AppEvents.GOOGLE_TOKEN, token.access_token)
    },
  });

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

  return (
    <PrimaryButton
      {...props}
      id='google-auth-button'
      onClick={() => {
        login()
      }}
    >
      <FontAwesomeIcon icon={faGoogleDrive} />
      &nbsp;
      {t('Google Drive')}
    </PrimaryButton>
  );
}

export default GoogleButton;
