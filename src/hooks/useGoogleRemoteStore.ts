/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { encoder } from '@utils/index';
import useGoogleDrive from './useGoogleDrive';
import useGoogleApi from './useGoogleApi';
import { RemoteStore } from 'src/types/collective';
import { AppEvents, bus } from 'src/events';
import { AccountSyncService } from './useAccountSync';

const fileIdCache = new Map<string, string>();

const prefixFilename = (path: string) => path.charAt(0) === '/' ? path : `/${path}`;

const listDirectory = (filenames: string[], search: string) => {
  const set = filenames.reduce((acc: Set<string>, cur: string) => {
    const index = cur.indexOf(search);
    if (index !== -1) {
      const sliced = cur.slice(search.length);
      const nextSlash = sliced.indexOf('/');
      acc.add(sliced.slice(0, nextSlash !== -1 ? nextSlash : undefined))
    }
    return acc;
  }, new Set())
  .values();

  return Array.from(set);
}

const useGoogleRemoteStore = () => {
  const [accessToken, setAccessToken] = useState<string>();
  const { gapi } = useGoogleApi();
  const { drive } = useGoogleDrive(gapi, accessToken);

  useEffect(() => {
    bus.addListener(AppEvents.GOOGLE_TOKEN, setAccessToken);

    return () => { bus.removeListener(AppEvents.GOOGLE_TOKEN, setAccessToken) }
  }, []);

  const deleteFile = useCallback(
    (fileId: string) => drive.files.delete({ fileId: fileId }),
    [drive?.files]
  );

  const deleteAllFiles = useCallback(async () => {
    const res = await drive.files.list({
      spaces: 'appDataFolder',
      fields: 'nextPageToken, files(id)',
      pageSize: 1000,
    });

    await Promise.all(res.result.files.map((file: any) => deleteFile(file.id)  ));
  }, [drive?.files, deleteFile]);

  const getFile = useCallback(async (name: string) => (await drive.files.list({
    q: `name = \'${name}\'`,
    spaces: 'appDataFolder',
    fields: 'nextPageToken, files(id, name, modifiedTime)',
    pageSize: 1,
  })).result.files[0], [drive?.files])

  const getLastModified = useCallback(async (path: string) => {
    const file = await getFile(prefixFilename(path));

    return file.modifiedTime;
  }, [getFile]);

  const getFileId = useCallback(async (name: string): Promise<any> => {
    const prefixed = prefixFilename(name);
    let id = fileIdCache.get(prefixed);
    if (!id) {
      const file = await getFile(prefixed);
      if (file) {
        fileIdCache.set(prefixed, file.id);
        id = file.id;
      }
    }
    return id;
  }, [getFile]);

  const getBinaryFile = useCallback(async (name: string) => {
    const prefixed = prefixFilename(name);
    const fileId = await getFileId(prefixed);

    const contents = await drive.files.get({
      fileId: fileId,
      alt: 'media'
    });

    return encoder.encode(contents.body);
  }, [drive?.files, getFileId]);

  const readDir = useCallback(async (folderName: string): Promise<string[]> => {
    const filenamesResult = await drive.files.list({
      fields: 'files(id, name)',
      spaces: ['appDataFolder']
    });

    const prefixedFolderName = prefixFilename(folderName);
    const suffixedFoldername = prefixedFolderName.charAt(prefixedFolderName.length - 1) === '/' ? prefixedFolderName : `${prefixedFolderName}/`;

    const filenames = filenamesResult.result.files
      .map((file: any) => prefixFilename(file.name));

    return listDirectory(filenames, suffixedFoldername);
  }, [drive?.files]);

  const uploadBinaryFile = useCallback((path: string, data: Uint8Array) => {
    return new Promise<string>((res, rej) => {
      const file = new Blob([data], { type: 'application/octet-stream' });
      const metadata = {
        name: path,
        spaces: 'appDataFolder',
        mimeType: 'application/octet-stream',
        parents: ['appDataFolder']
      };
  
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
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

  const updateFile = useCallback(async (fileId: string, data: Uint8Array) => {
    return new Promise<string>((res, rej) => {
      const file = new Blob([data], { type: 'application/octet-stream' });
      const metadata = {
        fileId,
        spaces: 'appDataFolder',
        mimeType: 'application/octet-stream',
      };
  
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);
  
      const xhr = new XMLHttpRequest();
      xhr.open('PATCH', `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`);
      xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
      xhr.responseType = 'json';
      xhr.onerror = rej;
      xhr.onload = () => {
        res(xhr.response.id); // Retrieve uploaded file ID.
      };
      xhr.send(form);
    });
  }, [accessToken]);

  const writeFile = useCallback(async (path: string, data: Uint8Array) => {
    const prefixed = prefixFilename(path);
    const existingFileId = await getFileId(prefixed)

    if (existingFileId) {
      await updateFile(existingFileId, data);
    } else {
      const id = await uploadBinaryFile(prefixed, data);
      fileIdCache.set(prefixed, id);
    }
  }, [getFileId, updateFile, uploadBinaryFile])

  const store = useMemo(
    () => (drive && accessToken) ? new RemoteStore(AccountSyncService.Google, {
      Write: writeFile,
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
      writeFile,
    ]
  );

  return store;
}

export default useGoogleRemoteStore;