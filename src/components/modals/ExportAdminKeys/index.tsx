import { FC, useCallback, useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { saveAs } from 'file-saver';
import { useTranslation } from 'react-i18next';

import { Button } from 'src/components/common';
import useStep from 'src/hooks/useStep';
import { useAuthentication } from 'src/contexts/authentication-context';
import useInput from 'src/hooks/useInput';
import { useNetworkClient } from 'src/contexts/network-client-context';
import * as channels from 'src/store/channels';
import { useAppSelector } from 'src/store/hooks';

import s from './styles.module.scss';
import ModalTitle from '../ModalTitle';
import Input from '@components/common/Input';
import { useUI } from '@contexts/ui-context';
import Keys from '@components/icons/Keys';

const ExportCodenameView: FC = () => {
  const { t } = useTranslation();
  const { alert, closeModal } = useUI();
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
  ]);

  useEffect(() => {
    if (step === 3) {
      alert({ type: 'success', content: t('Admin keys successfully exported'), icon: Keys });
      closeModal();
    }
  }, [alert, step, t, closeModal])

  return (
    <>
      <ModalTitle className='text-center'>
        {t('Export Channel Admin Keys')}
      </ModalTitle>
      {step === 1 && (
        <>
          {error && (
            <div className={'text text--xs mt-2 mb-4'} style={{ color: 'var(--red)' }}>
              {error}
            </div>
          )}
          <Input
            type='password'
            placeholder={t('Unlock export with your password')}
            onKeyDown={(e) => e.key === 'Enter' && checkPassword()}
            value={password}
            onChange={setPassword}
          />
          <Button
            className={cn('mt-5', s.button)}
            onClick={checkPassword}
          >
            {t('Unlock')}
          </Button>
        </>
      )}
      {step === 2 && (
        <>
          <h3 className='mb-6' style={{ color: 'var(--red)' }}>
            {t('Warning!')}
          </h3>
          <p className='text-center' style={{ color: 'var(--red)' }}>
            {t(`Anyone with these keys and encryption password can be an admin
            of this channel, they can pin messages, delete messages, and mute
            users.`)}
          </p>
          <div className='mt-10 w-full'>
            {error && (
              <div className={'text text-center text--xs mt-2 mb-4'} style={{ color: 'var(--red)' }}>
                {error}
              </div>
            )}
            <div className='space-y-6'>
              <Input
                type='password'
                placeholder={t('Password to encrypt the exported file')}
                value={encryptionPassword}
                onChange={setEncryptionPassword}
              />
              <Input
                type='password'
                placeholder={t('Confirm encryption password')}
                value={encryptionPasswordConfirmation}
                onChange={setEncryptionPasswordConfirmation}
              />
            </div>
            <input
              type='file'
              hidden
              ref={fileInputRef}
            />
          </div>
          <div className='space-x-4 flex justify-between w-full'>
            <Button
              variant='outlined'
              onClick={reset}
            >
              {t('Cancel')}
            </Button>
            <Button
              onClick={onExport}
            >
              {t('Export')}
            </Button>
          </div>
        </>
      )}
    </>
  );
};

export default ExportCodenameView;
