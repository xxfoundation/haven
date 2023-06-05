/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { encoder } from '@utils/index';
import useGoogleDrive from './useGoogleDrive';
import useGoogleApi from './useGoogleApi';
import { RemoteStore } from 'src/types/collective';
import { AppEvents, bus } from 'src/events';
import { AccountSyncService } from './useAccountSync';
import assert from 'assert';

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

  const getLastModified = useCallback(async (path: string) => {
    const res = await drive.files.list({
      q: `name = \'${path}\'`,
      spaces: 'appDataFolder',
      fields: 'nextPageToken, files(modifiedTime)',
      pageSize: 1,
    });

    const file = res.result.files[0];

    if (!file) {
      return null;
    }

    return file.modifiedTime;
  }, [drive?.files]);

  const findFolder = useCallback(async (folderName: string, parent?: string): Promise<any> => {
    const q = `name = \'${folderName}\' and mimeType = \'application/vnd.google-apps.folder\'`;
    const res = await drive.files.list({
      q: parent ? q.concat(` and '${parent}' in parents`) : q,
      fields: 'files(id, name)',
      spaces: 'appDataFolder'
    });
    return res.result.files[0];
  }, [drive?.files]);

  const getFile = useCallback(async (name: string, parent = 'appDataFolder'): Promise<any> => {
    const folders = name.indexOf('/') !== -1 ? name.split('/').slice(0, 1) : [];
    const lastFolder = folders.slice(-1)[0];

    if (lastFolder) {
      const found = await findFolder(lastFolder, parent);
      if (found) {
        return getFile(name.split('/').slice(1).join('/'), found.id)
      } else {
        return null;
      }
    }

    const res = await drive.files.list({
      q: `name = \'${name}\' and '${parent}' in parents`,
      spaces: 'appDataFolder',
      fields: 'nextPageToken, files(id, name, modifiedTime)',
      pageSize: 1,
    });
    
    return res.result.files[0];
  }, [drive?.files, findFolder]);

  const getBinaryFile = useCallback(async (name: string) => {
    const file = await getFile(name);

    if (!file) {
      return null;
    }

    const contents = await drive.files.get({
      fileId: file.id,
      alt: 'media'
    });

    return encoder.encode(contents.body);
  }, [drive?.files, getFile]);

  const readDir = useCallback(async (folderName: string): Promise<string[]> => {
    const parsedDirs = folderName.split('/').filter((d) => !!d);

    let lastParent: string | undefined;
    for (const folder of parsedDirs) {
      const found = await findFolder(folder, lastParent);
      if (found) {
        lastParent = found.id;
      } else {
        return [];
      }
    }

    let filenames: string[] = [];
    const filenamesResult = await drive.files.list({
      q: lastParent ? `'${lastParent}' in parents` : '',
      fields: 'files(id, name)',
      spaces: ['appDataFolder']
    });

    filenames = filenamesResult.result.files.map((file: any) => file.name);

    return filenames;
  }, [drive?.files, findFolder]);

  const uploadBinaryFile = useCallback((path: string, data: Uint8Array, parent?: string) => {
    return new Promise<void>((res, rej) => {
      const file = new Blob([data], { type: 'application/octet-stream' });
      const metadata = {
        name: path,
        spaces: 'appDataFolder',
        mimeType: 'application/octet-stream', 
        parents: parent ? [parent] : ['appDataFolder'] // Folder ID at Google Drive
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

  const createFolder = useCallback(async (folderName: string, parent?: string): Promise<{ id: string }> => {
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      spaces: 'appDataFolder',
      parents: parent ? [parent] : ['appDataFolder']
    };

    return (await drive.files.create({
      resource: fileMetadata,
      fields: 'id'
    })).result;
  }, [drive?.files]);

  const writeFile = useCallback(async (path: string, data: Uint8Array) => {
    const folders = path.split('/').filter((d) => !!d).slice(0, -1);
    let lastParent: string | undefined;
    for (const folder of folders) {
      const dir = await findFolder(folder);
      if (!dir) {
        const created = await createFolder(folder, lastParent);
        
        lastParent = created.id;
      } else {
        lastParent = dir.id;
      }
      assert(lastParent, 'Failed to create folder');
    }

    const filename = path.split('/').slice(-1)[0];

    const oldFile = await getFile(filename, lastParent);

    await uploadBinaryFile(filename, data, lastParent);

    if (oldFile) {
      deleteFile(oldFile.id);
    }
  }, [createFolder, deleteFile, findFolder, getFile, uploadBinaryFile])

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