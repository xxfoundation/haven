/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from 'react';

import { encoder } from '@utils/index';
import useGoogleDrive from './useGoogleDrive';
import useGoogleApi from './useGoogleApi';
import { RemoteStore } from 'src/types/collective';
import { AppEvents, bus } from 'src/events';
import { AccountSyncService } from './useAccountSync';

const useGoogleRemoteStore = () => {
  const [accessToken, setAccessToken] = useState<string>();
  const { gapi } = useGoogleApi();
  const { drive } = useGoogleDrive(gapi, accessToken);

  useEffect(() => {
    bus.addListener(AppEvents.GOOGLE_TOKEN, setAccessToken);

    return () => { bus.removeListener(AppEvents.GOOGLE_TOKEN, setAccessToken) }
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
  }, [drive?.files]);

  const deleteAllFiles = useCallback(async () => {
    const res = await drive.files.list({
      spaces: 'appDataFolder',
      fields: 'nextPageToken, files(id)',
      pageSize: 1000,
    });

    await Promise.all(res.result.files.map((file: any) => 
      drive.files.delete({ fileId: file.id })
    ));
  }, [drive?.files]);

  const getLastModified = useCallback(async (path: string) => {
    const res = await drive.files.list({
      q: `name = \'${path}\'`,
      spaces: 'appDataFolder',
      fields: 'nextPageToken, files(modifiedTime)',
      pageSize: 1,
    });

    const file = res.result.files[0];

    if (!file) {
      throw new Error(`File ${name} not found`);
    }

    return file.modifiedTime;
  }, [drive?.files]);

  const readDir = useCallback(async (path: string): Promise<string[]> => {
    const res = await drive.files.list({
      q: path ? `name = \'${path}\'` : '',
      spaces: 'appDataFolder',
      fields: 'nextPageToken, files(name)',
    });

    const files = res.result.files;

    return files.map((file: { name: string }) => file.name);
  }, [drive?.files]);

  const uploadBinaryFile = useCallback((path: string, data: Uint8Array) => {
    return new Promise<void>((res, rej) => {
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
    });
    
  }, [accessToken]);

  const store = useMemo(
    () => (drive && accessToken) ? new RemoteStore(AccountSyncService.Google, {
      Write: uploadBinaryFile,
      Read: getBinaryFile,
      GetLastModified: getLastModified,
      ReadDir: readDir,
      DeleteAll: deleteAllFiles,
    }) : undefined,
    [
      accessToken,
      deleteAllFiles,
      drive,
      getBinaryFile,
      getLastModified,
      readDir,
      uploadBinaryFile
    ]
  );

  return store;
}

export default useGoogleRemoteStore;