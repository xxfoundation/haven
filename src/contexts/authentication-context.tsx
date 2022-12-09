import { WithChildren } from '@types';

import React, { FC, useCallback, useState } from 'react';
import { ELIXXIR_USERS_TAGS, STATE_PATH } from '../constants';
import { useUtils } from 'src/contexts/utils-context';
import useLocalStorage from 'src/hooks/useLocalStorage';

type AuthenticationContextType = {
  checkUser: (password: string) => Uint8Array | false;
  statePathExists: () => boolean;
  setStatePath: () => void;
  getStorageTag: () => string | null;
  addStorageTag: (tag: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (authenticated: boolean) => void;
};

export const AuthenticationContext = React.createContext<AuthenticationContextType>({
  isAuthenticated: false,
} as AuthenticationContextType);

AuthenticationContext.displayName = 'AuthenticationContext';

const getStorageTag = () => {
  const usersStorageTags = JSON.parse(
    window.localStorage.getItem(ELIXXIR_USERS_TAGS) || '[]'
  );
  return usersStorageTags.length ? usersStorageTags[0] : null;
};

const addStorageTag = (storageTag: string) => {
  const existedUsersStorageTags = JSON.parse(
    window.localStorage.getItem(ELIXXIR_USERS_TAGS) || '[]'
  );

  existedUsersStorageTags.push(storageTag);
  window.localStorage.setItem(
    ELIXXIR_USERS_TAGS,
    JSON.stringify(existedUsersStorageTags)
  );
};

export const AuthenticationProvider: FC<WithChildren> = (props) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { utils } = useUtils();
  const [statePath, setStatePath] = useLocalStorage(STATE_PATH, '');

  const checkUser = useCallback((password: string) => {
    try {
      const statePassEncoded = utils.GetOrInitPassword(password);
      return statePassEncoded;
    } catch (error) {
      return false;
    }
  }, [utils]);

  return (
    <AuthenticationContext.Provider
      value={{
        checkUser,
        statePathExists: () => !!statePath,
        setStatePath: () => setStatePath('true'),
        getStorageTag: getStorageTag,
        addStorageTag,
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
