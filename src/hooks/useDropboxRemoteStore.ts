import { Dropbox } from 'dropbox';
import { useCallback, useEffect, useState } from 'react';
import assert from 'assert';

import { AppEvents, bus } from 'src/events';
import { RemoteStore } from 'src/types/collective';

const useDropboxRemoteStore = () => {
  const [dropbox, setDropbox] = useState<Dropbox>();

  useEffect(() => {
    const onToken = (accessToken: string) => {
      setDropbox(new Dropbox({ accessToken }))
    }

    bus.addListener(AppEvents.DROPBOX_TOKEN, onToken);

    return () => {
      bus.removeListener(AppEvents.DROPBOX_TOKEN, onToken);
    }
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

  const uploadBinaryFile = useCallback(async (path: string, data: Uint8Array) => {
    assert(dropbox);

    await dropbox.filesUpload({ path, contents: data });
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
  }, [dropbox])


  return dropbox && new RemoteStore({
    Read: getBinaryFile,
    Write: uploadBinaryFile,
    GetLastModified: getLastModified,
    ReadDir: readDir
  });
}

export default useDropboxRemoteStore;
