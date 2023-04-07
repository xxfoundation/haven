/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useCallback, useEffect, useState } from 'react';
import { ModalCtaButton } from '@components/common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogleDrive } from '@fortawesome/free-brands-svg-icons';
import { useTranslation } from 'react-i18next';
import { useGoogleLogin } from '@react-oauth/google';
import EventEmitter from 'events';
import useGoogleApi from 'src/hooks/useGoogleApi';
import useGoogleDrive from 'src/hooks/useGoogleDrive';
import { encoder } from '@utils/index';

declare global {
  interface Window {
    google: any;
  }
}


type Props = {
  onSync: () => void;
}

const bus = new EventEmitter();

const GoogleButton: FC<Props>  = ({ }) => {
  const { gapi } = useGoogleApi();
  const [accessToken, setAccessToken] = useState<string>();
  const { t } = useTranslation();
  const { drive } = useGoogleDrive(gapi, accessToken);

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/drive.appdata',
    prompt: 'consent',
    onSuccess: (token) => {
      bus.emit('token', token.access_token)
    },
  });

  useEffect(() => {
    bus.addListener('token', setAccessToken);

    return () => { bus.removeListener('token', setAccessToken) }
  }, []);

  const getBinaryFile = useCallback(async (name: string) => {
    const res = await drive.files.list({
      q: `name = \'${name}\'`,
      spaces: 'appDataFolder',
      fields: 'nextPageToken, files(id, name, modifiedTime)',
      pageSize: 1,
    });
    const file = res.result.files[0];

    if (!file) {
      throw new Error(`File ${name} not found`);
    }

    const contents = await drive.files.get({
      fileId: file.id,
      alt: 'media'
    });

    return encoder.encode(contents.body);
  }, [drive?.files])

  const uploadBinaryFile = useCallback((path: string, data: Uint8Array) => {
    return new Promise<string>((res, rej) => {
      const file = new Blob([data], { type: 'application/octet-stream' });
      const metadata = {
        name: path,
        mimeType: 'application/octet-stream', 
        parents: ['appDataFolder'], // Folder ID at Google Drive
      };
  
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
      form.append('file', file);
  
      const xhr = new XMLHttpRequest();
      xhr.open('post', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id');
      xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
      xhr.responseType = 'json';
      xhr.onerror = rej;
      xhr.onload = () => {
        res(xhr.response.id); // Retrieve uploaded file ID.
      };
      xhr.send(form);
    })
    
  }, [accessToken]);



  useEffect(() => {
    if (drive) {
      uploadBinaryFile('test/balls', new Uint8Array([1,2,3,4])).then(() => {
        getBinaryFile('test/balls').then((file) => {
          console.log('Google File:', file);
        });
      })
    }
  }, [accessToken, drive, getBinaryFile, uploadBinaryFile]);


  return (
    <ModalCtaButton
      id='google-auth-button'
      onClick={() => login()}
      buttonCopy={
        <>
          <FontAwesomeIcon icon={faGoogleDrive} />
          &nbsp;
          {t('Google Drive')}
        </>
      }
    />
  );
}

export default GoogleButton;
