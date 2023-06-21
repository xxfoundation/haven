import { FC, useCallback, useRef, useState } from 'react';
import cn from 'classnames';
import { saveAs } from 'file-saver';
import { useTranslation } from 'react-i18next';

import { PrimaryButton, SecondaryButton } from 'src/components/common';
import useStep from 'src/hooks/useStep';
import { useAuthentication } from 'src/contexts/authentication-context';
import useInput from 'src/hooks/useInput';
import { useNetworkClient } from 'src/contexts/network-client-context';
import * as channels from 'src/store/channels';
import { useAppSelector } from 'src/store/hooks';

import s from './styles.module.scss';

const ExportCodenameView: FC = () => {
  const { t } = useTranslation();
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const { exportChannelAdminKeys } = useNetworkClient();
  const { getOrInitPassword } = useAuthentication();
  const [password, setPassword] = useInput('');
  const [encryptionPassword, setEncryptionPassword] = useInput('');
  const [encryptionPasswordConfirmation, setEncryptionPasswordConfirmation] = useInput('');
  const [error, setError] = useState('');
  const [step, { next, reset }] = useStep(3);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkPassword = useCallback(async () => {
    if (await getOrInitPassword(password)) {
      setError('');
      next();
    } else {
      setError(t('Invalid Password'));
    }
  }, [t, getOrInitPassword, next, password]);

  const onExport = useCallback(() => {
    if (encryptionPassword !== encryptionPasswordConfirmation) {
      return setError(t('Encryption password does not match confirmation.'));
    }

    const filename = `${currentChannel?.name}_AdminKeys.txt`;
    const keys = exportChannelAdminKeys(encryptionPassword);
    const blob = new Blob([keys], { type: 'text/plain' });
    saveAs(blob, filename);
    next();
  }, [
    t,
    currentChannel?.name,
    encryptionPassword,
    encryptionPasswordConfirmation,
    exportChannelAdminKeys,
    next
  ])

  return (
    <div
      className={cn('w-full flex flex-col justify-center items-center', s.root)}
    >
      <h2 className='mb-10'>
        {t('Export Channel Admin Keys')}
      </h2>
      {step === 1 && (
        <>
          {error && (
            <div className={'text text--xs mt-2 mb-4'} style={{ color: 'var(--red)' }}>
              {error}
            </div>
          )}
          <input
            type='password'
            placeholder={t('Unlock export with your password')}
            onKeyDown={(e) => e.key === 'Enter' && checkPassword()}
            value={password}
            onChange={setPassword}
          />
          <PrimaryButton
            className={cn('mt-5', s.button)}
            onClick={checkPassword}
          >
            {t('Unlock')}
          </PrimaryButton>
        </>
      )}
      {step === 2 && (
        <>
          <h3 className='mb-6' style={{ color: 'var(--red)' }}>
            {t('Warning!')}
          </h3>
          <p style={{ color: 'var(--red)' }}>
            {t(`Anyone with these keys and encryption password can be an admin
            of this channel, they can pin messages, delete messages, and mute
            users.`)}
          </p>
          <div className='mt-10'>
            {error && (
              <div className={'text text-center text--xs mt-2 mb-4'} style={{ color: 'var(--red)' }}>
                {error}
              </div>
            )}
            <input
              type='password'
              placeholder={t('Password to encrypt the exported file')}
              value={encryptionPassword}
              onChange={setEncryptionPassword}
            />
            <input
              type='password'
              placeholder={t('Confirm encryption password')}
              value={encryptionPasswordConfirmation}
              onChange={setEncryptionPasswordConfirmation}
            />
            <input
              type='file'
              hidden
              ref={fileInputRef}
            />
          </div>
          <div className='space-x-4 flex'>
            <SecondaryButton
              className={cn('mt-5', s.button)}
              onClick={reset}
            >
              {t('Cancel')}
            </SecondaryButton>
            <PrimaryButton
              className={cn('mt-5', s.button)}
              onClick={onExport}
            >
              {t('Export')}
            </PrimaryButton>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h3 className='mb-6' style={{ color: 'var(--green)' }}>
            {t('Success!')}
          </h3>
          <p style={{ textAlign: 'center' }}>
            {t('The admin keys to {{channelName}} were successfully exported.', { channelName: currentChannel?.name })}
          </p>
        </>
      )}
    </div>
  );
};

export default ExportCodenameView;
