import { Dropbox, DropboxAuth } from 'dropbox';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { faDropbox } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import { ModalCtaButton } from '@components/common';
import assert from 'assert';


type Props = {
  onSync: () => void;
}

const DropboxButton: FC<Props> = () => {
  const [dropbox, setDropbox] = useState<Dropbox>();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { t } = useTranslation();

  const auth = useMemo(() => new DropboxAuth({
    clientId: process.env.NEXT_PUBLIC_APP_DROPBOX_CLIENT_ID,
  }), []);

  useEffect(() => {
    const onTokenMessage = (e: MessageEvent) => {
      if (window.location.origin === e.origin && e.data.code) {
        setAccessToken(e.data.code);
      }
    }

    window.addEventListener('message', onTokenMessage, false);

    return () => window.removeEventListener('message', onTokenMessage)
  }, []);

  useEffect(() => {
    if (accessToken) {
      setDropbox(new Dropbox({ accessToken }));
    }
  }, [accessToken]);


  const getBinaryFile = useCallback(async (name: string) => {
    assert(dropbox);
    const res = await dropbox.filesDownload({ path: name });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = (res.result as any).fileBlob as Blob;
    const buffer = await new Response(blob).arrayBuffer();
    return [...new Uint8Array(buffer)];
  }, [dropbox]);

  const uploadBinaryFile = useCallback((path: string, data: Uint8Array) => {
    assert(dropbox);

    return dropbox.filesUpload({ path, contents: data });
  }, [dropbox]);
    
  const onClick = useCallback(async () => {
    const redirectUrl = new URL(window.location.href);
    redirectUrl.pathname = 'dropbox';
    const url = (await auth.getAuthenticationUrl(redirectUrl.href, undefined, 'token')).toString();
    window.open(url, '_blank', 'width=600,height=700');
  }, [auth]);

  useEffect(() => {
    if (dropbox) {
      uploadBinaryFile('/test/balls', new Uint8Array([1,2,3,4])).then(() => {
        getBinaryFile('/test/balls').then((file) => {
          // eslint-disable-next-line no-console
          console.log('Dropbox File:', file);
        });
      })
    }
  }, [dropbox, getBinaryFile, uploadBinaryFile])

  return (
    <ModalCtaButton
      onClick={onClick}
      buttonCopy={<>
      <FontAwesomeIcon icon={faDropbox} />
      &nbsp;
        {t('Dropbox')}
      </>}
    />
  )
}

export default DropboxButton;
