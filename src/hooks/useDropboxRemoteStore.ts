import { Dropbox } from 'dropbox';
import { useCallback, useEffect, useState } from 'react';
import assert from 'assert';

import { AppEvents, bus } from 'src/events';
import { RemoteStore } from 'src/types/collective';
import { AccountSyncService } from './useAccountSync';

const useDropboxRemoteStore = () => {
  const [dropbox, setDropbox] = useState<Dropbox>();
  const [store, setStore] = useState<RemoteStore>();

  useEffect(() => {
    const onToken = (accessToken: string) => {
      setDropbox(new Dropbox({ accessToken }))
    }

    bus.addListener(AppEvents.DROPBOX_TOKEN, onToken);

    return () => {
      bus.removeListener(AppEvents.DROPBOX_TOKEN, onToken);
    }
  }, []);

  useEffect(() => {
    const listener = () => {
      setStore(undefined);
    };

    bus.addListener(AppEvents.NEW_SYNC_CMIX_FAILED, listener);

    return () => { bus.removeListener(AppEvents.NEW_SYNC_CMIX_FAILED, listener) }
  }, []);

  const getBinaryFile = useCallback(async (name: string) => {
    assert(dropbox);
    const path = name.charAt(0) !== '/' ? `/${name}` : name;
    const res = await dropbox.filesDownload({ path });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = (res.result as any).fileBlob as Blob;
    const buffer = await new Response(blob).arrayBuffer();
    return new Uint8Array(buffer);
  }, [dropbox]);

  const writeFile = useCallback(async (path: string, data: Uint8Array) => {
    assert(dropbox);

    const prefixedPath = path.charAt(0) !== '/' ? `/${path}` : path;
    await dropbox.filesUpload({
      path: prefixedPath,
      contents: data,
      mode: { '.tag': 'overwrite' }
    });
  }, [dropbox]);

  const getLastModified = useCallback(async (name: string) => {
    assert(dropbox);
    const path = name.charAt(0) !== '/' ? `/${name}` : name;
    const res = await dropbox.filesDownload({ path });
    return res.result.server_modified;
  }, [dropbox]);

  const readDir = useCallback(async (name: string) => {
    assert(dropbox);
    const path = name.charAt(0) !== '/' ? `/${name}` : name;

    const res = await dropbox.filesListFolder({ path });
    return res.result.entries.map((e) => e.name);
  }, [dropbox]);


  const deleteAllFiles = useCallback(async () => {
    assert(dropbox);
    const res = await dropbox.filesListFolder({ path: '/', recursive: true });
    const entries = res.result.entries.map((e) => ({ path: e.path_lower || e.name }));
    await dropbox.filesDeleteBatch({ entries })
  }, [dropbox]);

  useEffect(() => {
    if (dropbox) { 
      setStore(new RemoteStore(AccountSyncService.Dropbox, {
        Write: writeFile,
        Read: getBinaryFile,
        GetLastModified: getLastModified,
        ReadDir: readDir,
        DeleteAll: deleteAllFiles,
      }));
    }
  }, [deleteAllFiles, dropbox, getBinaryFile, getLastModified, readDir, writeFile]);

  return store;
}

export default useDropboxRemoteStore;
