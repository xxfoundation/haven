import { FC, useCallback, useRef, useState } from 'react';
import cn from 'classnames';

import s from './styles.module.scss';
import { ModalCtaButton } from 'src/components/common';
import useInput from 'src/hooks/useInput';
import { useNetworkClient } from '@contexts/network-client-context';

import { Upload } from 'src/components/icons';


const ExportCodenameView: FC = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { currentChannel, importChannelAdminKeys, upgradeAdmin } = useNetworkClient();
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
      setError('That didnt work. Please check your credentials.');
    }
  }, [importChannelAdminKeys, password, privateKeys, upgradeAdmin])

  return (
    <div
      className={cn('w-full flex flex-col justify-center items-center text-center', s.root)}
    >
      <h2 className='mb-10'>Import Channel Admin Keys</h2>
      {success ? (
        <>
          <h3 className='mb-6' style={{ color: 'var(--green)' }}>
            Success!
          </h3>
          <p style={{ textAlign: 'center' }}>
            The admin keys to {currentChannel?.name} were successfully imported.
          </p>
        </>
      ) : (
        <>
          <p className='mb-4'>
            By being an admin, you can pin messages, delete messages, mute users
          </p>
          <form onSubmit={onImport}>
            {error && (
              <div className={'text text--xs mt-2 mb-4'} style={{ color: 'var(--red)' }}>
                {error}
              </div>
            )}
            <input
              required
              id='adminKeysFile'
              type='file'
              placeholder='Choose a file containing the admin keys'
              onChange={onFileChange}
            />
            <label htmlFor='adminKeysFile' className='flex justify-between'>
              <span ref={fileInputLabelRef}>
                Choose a file
              </span>
              <Upload />
            </label>
            <input
              required
              type='password'
              placeholder='Unlock export with your password'
              value={password}
              onChange={setPassword}
            />

            <ModalCtaButton
              type='submit'
              buttonCopy='Import'
              cssClass={cn('mt-5', s.button)}
            />
          </form>
        </>
      )}
    </div>
  );
};

export default ExportCodenameView;
