import { WithChildren } from '@types';

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { CHANNELS_STORAGE_TAG, STATE_PATH } from '../constants';
import { useUtils } from 'src/contexts/utils-context';
import useLocalStorage from 'src/hooks/useLocalStorage';
import { v4 as uuid } from 'uuid';

type AuthenticationContextType = {
  checkUser: (password: string) => Uint8Array | false;
  statePathExists: () => boolean;
  storageTag: string | null;
  addStorageTag: (tag: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (authenticated: boolean) => void;
  instanceId: string;
};

export const AuthenticationContext = React.createContext<AuthenticationContextType>({
  isAuthenticated: false,
} as AuthenticationContextType);

AuthenticationContext.displayName = 'AuthenticationContext';

const statePathExists = () => {
  return localStorage && localStorage.getItem(STATE_PATH) !== null;
};

export const AuthenticationProvider: FC<WithChildren> = (props) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const instanceId = useMemo(() => uuid(), []);
  const { utils } = useUtils();
  const [storageTags, setStorageTags] = useLocalStorage<string[]>(CHANNELS_STORAGE_TAG, []);
  const authChannel = useMemo<BroadcastChannel>(() => new BroadcastChannel('authentication'), []);
  
  const checkUser = useCallback((password: string) => {
    try {
      const statePassEncoded = utils.GetOrInitPassword(password);
      return statePassEncoded;
    } catch (error) {
      return false;
    }
  }, [utils]);


  useEffect(() => {
    const onRequest = (ev: MessageEvent) => {
      if (ev.data.type === 'IS_AUTHENTICATED_REQUEST') {
        authChannel.postMessage({
          type: 'IS_AUTHENTICATED_RESPONSE',
          isAuthenticated,
          instanceId
        })
      }
    }

    authChannel.addEventListener('message', onRequest);

    return () => {
      authChannel.removeEventListener('message', onRequest);
    }
  }, [authChannel, isAuthenticated, instanceId])

  return (
    <AuthenticationContext.Provider
      value={{
        checkUser,
        instanceId,
        statePathExists,
        storageTag: storageTags?.[0] || null,
        addStorageTag: (tag: string) => setStorageTags((storageTags ?? []).concat(tag)),
        isAuthenticated,
        setIsAuthenticated
      }}
      {...props}
    />
  );
};

export const useAuthentication = () => {
  const context = React.useContext(AuthenticationContext);

  if (context === undefined) {
    throw new Error(
      'useAuthentication must be used within a AuthenticationProvider'
    );
  }


  return context;
};

export const ManagedAuthenticationContext: FC<WithChildren> = ({ children }) => (
  <AuthenticationProvider>{children}</AuthenticationProvider>
);
