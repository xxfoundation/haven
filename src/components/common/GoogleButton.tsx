/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogleDrive } from '@fortawesome/free-brands-svg-icons';
import { useTranslation } from 'react-i18next';
import { useGoogleLogin } from '@react-oauth/google';
import cn from 'classnames';

import { AppEvents, appBus } from 'src/events';
import Button, { Props as ButtonProps } from './Button';

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
    <Button
      {...props}
      className={cn('flex justify-center items-center space-x-1')}
      id='google-auth-button'
      onClick={() => {
        login()
      }}
    >
      <FontAwesomeIcon className='w-5 h-5' icon={faGoogleDrive} />
      &nbsp;
      <span className='whitespace-nowrap'>{t('Google Drive')}</span>
    </Button>
  );
}

export default GoogleButton;
