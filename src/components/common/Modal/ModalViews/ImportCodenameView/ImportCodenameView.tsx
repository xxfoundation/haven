import React, { FC, useState, useEffect, useRef, useCallback } from 'react';
import s from './ImportCodenameView.module.scss';
import { ModalCtaButton } from 'src/components/common';
import cn from 'classnames';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { useUI } from 'src/contexts/ui-context';
import { useUtils } from 'src/contexts/utils-context';
import { encoder } from 'src/utils';
import { Spinner } from 'src/components/common';
import { Upload } from 'src/components/icons';

const ImportCodenameView: FC = () => {
  const { closeModal } = useUI();
  const { initiateCmix, isReadyToRegister, cmix: network } = useNetworkClient();
  const fileInputLabelRef = useRef<HTMLSpanElement>(null);

  const {
    setShouldRenderImportCodeNameScreen,
    shouldRenderImportCodeNameScreen,
    transferIdentittyVariables,
    utils
  } = useUtils();
  const [password, setPassword] = useState<string>(
    transferIdentittyVariables.current.password || ''
  );
  const [privateIdentity, setPrivateIdentity] = useState<any>(
    transferIdentittyVariables.current.privateIdentity || ''
  );
  const [error, setError] = useState(
    transferIdentittyVariables.current.error || ''
  );

  const [isLoading, setIsLoading] = useState<boolean>(
    transferIdentittyVariables.current.isLoading || false
  );

  useEffect(() => {
    if (isReadyToRegister) {
      closeModal();
    }
  }, [closeModal, isReadyToRegister]);

  useEffect(() => {
    if (
      network &&
      privateIdentity &&
      password &&
      !shouldRenderImportCodeNameScreen
    ) {
      setShouldRenderImportCodeNameScreen(true);
    }
  }, [
    network,
    password,
    privateIdentity,
    setShouldRenderImportCodeNameScreen,
    shouldRenderImportCodeNameScreen
  ]);

  const handleSubmit = () => {
    setError('');
    if (
      password &&
      privateIdentity &&
      utils &&
      utils.ImportPrivateIdentity &&
      typeof utils.GetOrInitPassword === 'function'
    ) {
      try {
        utils.ImportPrivateIdentity(password, encoder.encode(privateIdentity));
        initiateCmix(password);
        transferIdentittyVariables.current = {
          ...transferIdentittyVariables.current,
          isLoading: true
        };
        setIsLoading(true);
      } catch (e) {
        setError('Incorrect file and/or password');
      }
    }
  };

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
    const reader = new FileReader();
    reader.onload = (evt) => {
      const fileContent = evt?.target?.result;
      transferIdentittyVariables.current = {
        ...transferIdentittyVariables.current,
        privateIdentity: fileContent
      };
      setPrivateIdentity(fileContent as string);
    };

    if (targetFile && e.target.files) {
      reader.readAsText(e.target.files[0]);
    }
  }, [transferIdentittyVariables]);

  return (
    <div className={cn('w-full flex flex-col items-center', s.root)}>
      <h2 className='mt-9 mb-4'>Import your account</h2>
      <p className='mb-8'>
        Note that importing your account will only restore your codename. You
        need to rejoin manually any previously joined channel
      </p>
      {isLoading ? (
        <div className='mt-20'>
          <Spinner />
        </div>
      ) : (
        <>
          <input
            id='identityFile'
            type='file'
            placeholder='Choose a file '
            onChange={onFileChange}
          />
          <label htmlFor='identityFile' className='flex justify-between'>
            <span ref={fileInputLabelRef}>Choose a file</span>
            <Upload />
          </label>
          <input
            type='password'
            placeholder='Unlock export with your password'
            value={password}
            onChange={(e) => {
              transferIdentittyVariables.current = {
                ...transferIdentittyVariables.current,
                password: e.target.value
              };
              setPassword(e.target.value);
            }}
          />
          {error && (
            <div
              className={'text text--xs mt-2'}
              style={{ color: 'var(--red)' }}
            >
              {error}
            </div>
          )}
          <ModalCtaButton
            buttonCopy='Import'
            cssClass={cn('mt-5', s.button)}
            onClick={handleSubmit}
          />
        </>
      )}
    </div>
  );
};

export default ImportCodenameView;
