import { FC, useCallback, useRef, useState } from 'react';
import cn from 'classnames';
import { saveAs } from 'file-saver';

import s from './styles.module.scss';
import { ModalCtaButton } from 'src/components/common';
import useStep from 'src/hooks/useStep';
import { useAuthentication } from 'src/contexts/authentication-context';
import useInput from 'src/hooks/useInput';
import { useNetworkClient } from '@contexts/network-client-context';

const ExportCodenameView: FC = () => {
  const { currentChannel, exportChannelAdminKeys } = useNetworkClient();
  const { checkUser } = useAuthentication();
  const [password, setPassword] = useInput('');
  const [encryptionPassword, setEncryptionPassword] = useInput('');
  const [encryptionPasswordConfirmation, setEncryptionPasswordConfirmation] = useInput('');
  const [error, setError] = useState('');
  const [step, { next, reset }] = useStep(3);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkPassword = useCallback(() => {
    if (checkUser(password)) {
      setError('');
      next();
    } else {
      setError('Invalid Password');
    }
  }, [checkUser, next, password]);

  const onExport = useCallback(() => {
    if (encryptionPassword !== encryptionPasswordConfirmation) {
      return setError('Encryption password does not match confirmation.');
    }

    const filename = `${currentChannel?.name}_AdminKeys.txt`;
    const keys = exportChannelAdminKeys(encryptionPassword);
    const blob = new Blob([keys], { type: 'text/plain' });
    saveAs(blob, filename);
    next();
  }, [
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
      <h2 className='mb-10'>Export Channel Admin Keys</h2>
      {step === 1 && (
        <>
          {error && (
            <div className={'text text--xs mt-2 mb-4'} style={{ color: 'var(--red)' }}>
              {error}
            </div>
          )}
          <input
            type='password'
            placeholder='Unlock export with your password'
            onKeyDown={(e) => e.key === 'Enter' && checkPassword()}
            value={password}
            onChange={setPassword}
          />
          <ModalCtaButton
            buttonCopy='Unlock'
            cssClass={cn('mt-5', s.button)}
            onClick={checkPassword}
          />
        </>
      )}
      {step === 2 && (
        <>
          <h3 className='mb-6' style={{ color: 'var(--red)' }}>
            Warning!
          </h3>
          <p style={{ color: 'var(--red)' }}>
            Anyone with these keys and encryption password can be an admin
            of this channel, they can pin messages, delete messages, and mute
            users.
          </p>
          <div className='mt-10'>
            {error && (
              <div className={'text text-center text--xs mt-2 mb-4'} style={{ color: 'var(--red)' }}>
                {error}
              </div>
            )}
            <input
              type='password'
              placeholder='Password to encrypt the exported file'
              value={encryptionPassword}
              onChange={setEncryptionPassword}
            />
            <input
              type='password'
              placeholder='Confirm encryption password'
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
            <ModalCtaButton
              style={{ borderColor: 'var(--cyan)', color: 'white' }}
              buttonCopy='Cancel'
              cssClass={cn('mt-5', s.button)}
              onClick={reset}
            />

            <ModalCtaButton
              buttonCopy='Export'
              cssClass={cn('mt-5', s.button)}
              onClick={onExport}
            />
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h3 className='mb-6' style={{ color: 'var(--green)' }}>
            Success!
          </h3>
          <p style={{ textAlign: 'center' }}>
            The admin keys to {currentChannel?.name} were successfully exported.
          </p>
        </>
      )}
    </div>
  );
};

export default ExportCodenameView;
