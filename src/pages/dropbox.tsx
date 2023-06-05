import { NextPage } from 'next';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const parseAuthCode = (url: string) => {
  const queryParams = new URLSearchParams(url);
  return queryParams.get('access_token');
}

const DropboxPage: NextPage = () => {
  const { t } = useTranslation();

  useEffect(() => {
    const code = parseAuthCode(window.location.hash.replace('#', ''));
    window.location.hash = '';
    opener = window.opener
    if (window.parent != window.top) {
      opener =  opener || window.parent
    }
    
    if (opener) {
      opener.postMessage({ code }, window.location.origin);
    }
    window.close();
  }, []);

  return <>
    {t('Getting auth code...')}
  </>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(DropboxPage as any).skipDuplicateTabCheck = true;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(DropboxPage as any).skipProviders = true;

export default DropboxPage;
