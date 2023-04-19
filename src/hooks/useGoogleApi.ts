/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';

type GoogleApiStatus = 'loading' | 'error' | 'ready';

interface GoogleApi {
  gapi: any;
  status: GoogleApiStatus;
}

declare global {
  interface Window {
    gapi: any;
  }
}

const useGoogleApi = (): GoogleApi => {
  const [status, setStatus] = useState<GoogleApiStatus>('loading');
  const [gapi, setGapi] = useState<any>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      window.gapi.load('client', async () => {
        setGapi(window.gapi);
      });
    };
    script.onerror = () => setStatus('error');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return { gapi, status };
};

export default useGoogleApi;