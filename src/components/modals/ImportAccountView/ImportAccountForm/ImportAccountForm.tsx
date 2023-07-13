import React, { FC, useState, useRef, useCallback } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import { Upload } from 'src/components/icons';
import { PrimaryButton } from 'src/components/common';

import s from './ImportAccountForm.module.scss';

type Props = {
  onSubmit: (value: { password: string, identity: string }) => Promise<void>;
}

const ImportAccountForm: FC<Props> = ({ onSubmit }) => {
  const { t } = useTranslation();
  const fileInputLabelRef = useRef<HTMLSpanElement>(null);
  const [password, setPassword] = useState<string>('');
  const [privateIdentity, setPrivateIdentity] = useState<string>('');
  const [error, setError] = useState('');

  const handleSubmission = useCallback(async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    try {
      await onSubmit({ password, identity: privateIdentity });
    } catch (e) {
      setError(t('Incorrect file and/or password'));
    }
  }, [t, onSubmit, password, privateIdentity])

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
        setPrivateIdentity(fileContent?.toString() ?? '');
      };
      reader.readAsText(e.target.files[0]);
    }
  }, []);

  return (
    <form
      onSubmit={handleSubmission}
      className={cn('w-full flex flex-col items-center', s.root)}
    >
      <h2 className='mt-9 mb-4'>
        {t('Import your account')}
      </h2>
      <p className='mb-8'>
        {t(`Note that importing your account will only restore your codename. You
        need to rejoin manually any previously joined channel`)}
      </p>
      {error && (
        <div
          className={'text text--xs mt-2'}
          style={{ color: 'var(--red)' }}
        >
          {error}
        </div>
      )}
      <input
        required
        id='identityFile'
        type='file'
        placeholder={t('Choose a file')}
        onChange={onFileChange}
      />
      <label htmlFor='identityFile' className='flex justify-between'>
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
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      />
      <PrimaryButton
        type='submit'
        className={cn('mt-5', s.button)}
      >
        {t('Import')}
      </PrimaryButton>
    </form>
  );
};

export default ImportAccountForm;
