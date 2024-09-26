/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';

interface GoogleDrive {
  drive: any;
  ready: boolean;
}

const useGoogleDrive = (gapi: any, accessToken?: string): GoogleDrive => {
  const [drive, setDrive] = useState<any>(null);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    const initDriveApi = async () => {
      try {
        gapi.client.load('drive', 'v3', async () => {
          await gapi.client.setToken({ access_token: accessToken });
          setDrive(gapi.client.drive);
          setReady(true);
        })
      } catch (error) {
        console.error('Error initializing Google Drive API:', error);
      }
    };

    if (gapi && accessToken) {
      initDriveApi();
    }
  }, [accessToken, gapi]);

  return { drive, ready };
};

export default useGoogleDrive;