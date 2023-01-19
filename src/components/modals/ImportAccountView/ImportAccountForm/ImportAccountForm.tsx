import React, { FC, useState, useRef, useCallback } from 'react';
import s from './ImportAccountForm.module.scss';
import { ModalCtaButton } from 'src/components/common';
import cn from 'classnames';

import { Upload } from 'src/components/icons';

type Props = {
  onSubmit: (value: { password: string, identity: string }) => Promise<void>;
}

const ImportAccountForm: FC<Props> = ({ onSubmit }) => {
  const fileInputLabelRef = useRef<HTMLSpanElement>(null);
  const [password, setPassword] = useState<string>('');
  const [privateIdentity, setPrivateIdentity] = useState<string>('');
  const [error, setError] = useState('');

  const handleSubmission = useCallback(async () => {
    try {
      await onSubmit({ password, identity: privateIdentity });
    } catch (e) {
      setError('Incorrect file and/or password');
    }
  }, [onSubmit, password, privateIdentity])

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
    <form onSubmit={handleSubmission} className={cn('w-full flex flex-col items-center', s.root)}>
      <h2 className='mt-9 mb-4'>Import your account</h2>
      <p className='mb-8'>
        Note that importing your account will only restore your codename. You
        need to rejoin manually any previously joined channel
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
        placeholder='Choose a file '
        onChange={onFileChange}
      />
      <label htmlFor='identityFile' className='flex justify-between'>
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
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      />
      <ModalCtaButton
        type='submit'
        buttonCopy='Import'
        cssClass={cn('mt-5', s.button)}
      />
    </form>
  );
};

export default ImportAccountForm;
