import React, { FC, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload } from 'src/components/icons';
import { Button } from 'src/components/common';

type Props = {
  onSubmit: (value: { password: string; identity: string }) => Promise<void>;
};

const ImportAccountForm: FC<Props> = ({ onSubmit }) => {
  const { t } = useTranslation();
  const fileInputLabelRef = useRef<HTMLSpanElement>(null);
  const [password, setPassword] = useState<string>('');
  const [privateIdentity, setPrivateIdentity] = useState<string>('');
  const [error, setError] = useState('');

  const handleSubmission = useCallback(
    async (evt: React.FormEvent<HTMLFormElement>) => {
      evt.preventDefault();
      try {
        await onSubmit({ password, identity: privateIdentity });
      } catch (e) {
        setError(t('Incorrect file and/or password'));
      }
    },
    [t, onSubmit, password, privateIdentity]
  );

  const onFileChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((e) => {
    const targetFile = e.target.files?.[0];

    e.preventDefault();
    if (fileInputLabelRef && fileInputLabelRef.current && targetFile && targetFile.name) {
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
    <form className="w-full flex flex-col items-center min-h-[476px]" onSubmit={handleSubmission}>
      <h2 className="mt-9 mb-4">{t('Import your account')}</h2>
      <p className="mb-8 font-medium text-xs leading-tight text-cyan max-w-[520px] text-left w-full">
        {t(`Note that importing your account will only restore your codename. You
        need to rejoin manually any previously joined channel`)}
      </p>
      {error && (
        <div className="text-xs mt-2 text-red">
          {error}
        </div>
      )}
      <input
        required
        id="identityFile"
        type="file"
        placeholder={t('Choose a file')}
        onChange={onFileChange}
        className="hidden"
      />
      <label 
        htmlFor="identityFile" 
        className="
          flex justify-between
          border-none outline-none
          bg-dark-5 px-2.5 py-[18px]
          text-text-primary text-sm
          w-full max-w-[520px] h-[55px]
          rounded mb-[26px]
          cursor-pointer
        "
      >
        <span ref={fileInputLabelRef}>{t('Choose a file')}</span>
        <Upload />
      </label>
      <input
        required
        type="password"
        placeholder={t('Unlock export with your password')}
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
        }}
        className="
          border-none outline-none
          bg-dark-5 px-2.5 py-[18px]
          text-text-primary text-sm
          w-full max-w-[520px] h-[55px]
          rounded mb-[26px]
        "
      />
      <Button type="submit" className="mt-5 text-black mb-30">
        {t('Import')}
      </Button>
    </form>
  );
};

export default ImportAccountForm;
