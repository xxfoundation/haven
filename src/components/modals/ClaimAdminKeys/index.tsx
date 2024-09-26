import { FC, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from 'src/components/common';
import useInput from 'src/hooks/useInput';
import { useNetworkClient } from '@contexts/network-client-context';
import { Upload } from 'src/components/icons';

import ModalTitle from '../ModalTitle';
import Input from '@components/common/Input';
import Checkmark from '@components/icons/Checkmark';
import FormError from '@components/common/FormError';
import { useUI } from '@contexts/ui-context';
import LockOpen from '@components/icons/LockOpen';

const ExportCodenameView: FC = () => {
  const { t } = useTranslation();
  const { alert, closeModal } = useUI();
  const [error, setError] = useState('');
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
      alert({
        type: 'success',
        content: t('Successfully imported admin keys'),
        icon: LockOpen,
      });
      closeModal();

    } catch (e) {
      console.error(e);
      setError(t('That didnt work. Please check your credentials and make sure you are trying to import the correct channel.'));
    }
  }, [importChannelAdminKeys, password, privateKeys, upgradeAdmin, alert, t, closeModal])

  return (
    <>
      <ModalTitle className='text-center text-2xl'>
        {t('Import Channel Admin Keys')}
      </ModalTitle>
      <p className='mb-4 text-charcoal-1'>
        {t(`
          By being an admin, you can pin messages, delete messages and
          mute users
        `)}
      </p>
      <form
        className='space-y-6'
        onKeyDown={(evt) => {
          if (evt.key === 'Enter') {
            onImport(evt)
          }
        }}
        onSubmit={onImport}
      >
        <div className='flex items-center justify-center w-full'>
          <label htmlFor='dropzone-file' className='flex flex-col items-center justify-center w-full h-32 border-2 border-charcoal-1 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800  hover:bg-charcoal-3-20'>
            <div className='flex flex-col items-center justify-center pt-5 pb-6'>
              {privateKeys
                ? <Checkmark className='w-6 h-6 text-green' />
                : <Upload className='w-6' />}
              <p ref={fileInputLabelRef} className='my-2 text-sm text-white'>
                <span className='font-semibold'>Click to upload</span> or drag and drop
              </p>
            </div>
            <input id='dropzone-file' onChange={onFileChange} type='file' className='hidden' />
          </label>
        </div> 
        {error && (
          <FormError>
            {error}
          </FormError>
        )}
        <div className='flex items-center space-x-1'>
          <Input
            required
            type='password'
            placeholder={t('File password')}
            value={password}
            onChange={setPassword}
          />

          <Button
            type='submit'
          >
            {t('Import')}
          </Button>
        </div>
        
      </form>
    </>
  );
};

export default ExportCodenameView;
