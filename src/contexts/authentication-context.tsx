import { WithChildren } from '@types';

import React, { FC, useCallback, useState } from 'react';
import { ELIXXIR_USERS_TAGS, STATE_PATH } from '../constants';
import { isClientSide } from 'src/utils';
import { useUtils } from 'src/contexts/utils-context';

export const AuthenticationContext = React.createContext<{
  checkUser: (password: string) => any;
  statePathExists: () => boolean;
  setStatePath: () => void;
  getStorageTags: () => string[];
  addStorageTag: (tag: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (authenticated: boolean) => void;
}>({
  checkUser: () => {},
  statePathExists: () => false,
  setStatePath: () => {},
  getStorageTags: () => [],
  addStorageTag: () => {},
  isAuthenticated: false,
  setIsAuthenticated: () => {}
});

AuthenticationContext.displayName = 'AuthenticationContext';

const isStatePathExisted = () => {
  return isClientSide() && localStorage.getItem(STATE_PATH) !== null;
};

const setStatePath = () => {
  if (isClientSide()) {
    window.localStorage.setItem(STATE_PATH, 'Test');
  }
};

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
        statePathExists: isStatePathExisted,
        setStatePath,
        getStorageTags: getStorageTag,
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

export const ManagedAuthenticationContext: FC<any> = ({ children }) => (
  <AuthenticationProvider>{children}</AuthenticationProvider>
);
