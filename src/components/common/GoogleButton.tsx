/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogleDrive } from '@fortawesome/free-brands-svg-icons';
import { useTranslation } from 'react-i18next';
import { useGoogleLogin } from '@react-oauth/google';
import { AppEvents, appBus } from 'src/events';
import PrimaryButton, { Props as ButtonProps } from './PrimaryButton/PrimaryButton';

declare global {
  interface Window {
    google: any;
  }
}

type Props = Partial<ButtonProps> & {
  onStartLoading?: () => void;
  password?: string;
}

const GoogleButton: FC<Props>  = ({
  onStartLoading = () => {},
  ...props
}) => {
  const { t } = useTranslation();

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/drive.appdata',
    prompt: 'consent',
    onSuccess: (token) => {
      onStartLoading();
      appBus.emit(AppEvents.GOOGLE_TOKEN, token.access_token)
    },
  });

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
