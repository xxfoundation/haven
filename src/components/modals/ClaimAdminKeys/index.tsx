import { FC, useCallback, useRef, useState } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import { Button } from 'src/components/common';
import useInput from 'src/hooks/useInput';
import { useNetworkClient } from '@contexts/network-client-context';
import { Upload } from 'src/components/icons';
import * as channels from 'src/store/channels';
import { useAppSelector } from 'src/store/hooks';

import s from './styles.module.scss';

const ExportCodenameView: FC = () => {
  const { t } = useTranslation();
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { importChannelAdminKeys, upgradeAdmin } = useNetworkClient();
  const [privateKeys, setPrivateKeys] = useState('');
  const [password, setPassword] = useInput('');
  const fileInputLabelRef = useRef<HTMLInputElement>(null);


  const onFileChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((e) => {
    const targetFile = e.target.files?.[0];

    e.preventDefault();
    if (
      fileInputLabelRef &&
      fileInputLabelRef.current &&
      targetFile &&
      targetFile.name
    ) {
      fileInputLabelRef.current.innerText = targetFile.name;
    }
    if (targetFile && e.target.files) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const fileContent = evt?.target?.result;
        setPrivateKeys(fileContent?.toString() ?? '');
      };
      reader.readAsText(e.target.files[0]);
    }
  }, []);

  const onImport = useCallback<React.FormEventHandler<HTMLFormElement>>((evt) => {
    evt.preventDefault();
    try {
      importChannelAdminKeys(password, privateKeys);
      upgradeAdmin();
      setSuccess(true);
    } catch (e) {
      console.error(e);
      setError(t('That didnt work. Please check your credentials.'));
    }
  }, [t, importChannelAdminKeys, password, privateKeys, upgradeAdmin])

  return (
    <div
      className={cn('w-full flex flex-col justify-center items-center text-center', s.root)}
    >
      <h2 className='mb-10'>
        {t('Import Channel Admin Keys')}
      </h2>
      {success ? (
        <>
          <h3 className='mb-6' style={{ color: 'var(--green)' }}>
            {t('Success!')}
          </h3>
          <p style={{ textAlign: 'center' }}>
            {t(
              'The admin keys to {{channelName}} were successfully imported.',
              { channelName: currentChannel?.name }
            )}
          </p>
        </>
      ) : (
        <>
          <p className='mb-4'>
            {t(`
              By being an admin, you can pin messages, delete messages and
              mute users
            `)}
          </p>
          <form 
            onKeyDown={(evt) => {
              if (evt.key === 'Enter') {
                onImport(evt)
              }
            }}
            onSubmit={onImport}
          >
            {error && (
              <div className={'text text--xs mt-2 mb-4'} style={{ color: 'var(--red)' }}>
                {error}
              </div>
            )}
            <input
              required
              id='adminKeysFile'
              type='file'
              placeholder={t('Choose a file containing the admin keys')}
              onChange={onFileChange}
            />
            <label htmlFor='adminKeysFile' className='flex justify-between'>
              <span ref={fileInputLabelRef}>
                {t('Choose a file')}
              </span>
              <Upload />
            </label>
            <input
              required
              type='password'
              placeholder={t('Unlock export with your password')}
              value={password}
              onChange={setPassword}
            />

            <Button
              type='submit'
              className={cn('mt-5', s.button)}
            >
              {t('Import')}
            </Button>
          </form>
        </>
      )}
    </div>
  );
};

export default ExportCodenameView;
