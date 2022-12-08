import React, { FC, useState } from "react";
import { STATE_PATH } from "../constants";
import { isClientSide } from "utils";
import { useUtils } from "contexts/utils-context";

interface IUser {
  userName: string;
  password: string;
}

interface IUserSecret {
  userName: string;
  secret: string;
}

export const usersStorageTagsKey = "ELIXXIR_USERS_TAGS";

export const AuthenticationContext = React.createContext<{
  checkUser: Function;
  isStatePathExisted: Function;
  setStatePath: Function;
  getStorageTag: Function;
  addStorageTag: Function;
  isAuthenticated: boolean;
  setIsAuthenticated: Function;
}>({
  checkUser: () => {},

  isStatePathExisted: () => {},
  setStatePath: () => {},
  getStorageTag: () => {},
  addStorageTag: () => {},
  isAuthenticated: false,
  setIsAuthenticated: () => {}
});

AuthenticationContext.displayName = "AuthenticationContext";

export const AuthenticationProvider: FC<any> = props => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { utils } = useUtils();

  const isStatePathExisted = () => {
    return isClientSide() && localStorage.getItem(STATE_PATH) !== null;
  };

  const setStatePath = () => {
    if (isClientSide()) {
      console.log(`Test setting ${STATE_PATH} in local storage`);
      window.localStorage.setItem(STATE_PATH, "Test");
    }
  };

  const getStorageTag = () => {
    const usersStorageTags = JSON.parse(
      window.localStorage.getItem(usersStorageTagsKey) || `[]`
    );
    return usersStorageTags.length ? usersStorageTags[0] : null;
  };

  const addStorageTag = (storageTag: string) => {
    const existedUsersStorageTags = JSON.parse(
      window.localStorage.getItem(usersStorageTagsKey) || `[]`
    );

    existedUsersStorageTags.push(storageTag);
    window.localStorage.setItem(
      usersStorageTagsKey,
      JSON.stringify(existedUsersStorageTags)
    );
  };

  const checkUser = (password: string) => {
    try {
      const statePassEncoded = utils.GetOrInitPassword(password);
      return statePassEncoded;
    } catch (error) {
      return false;
    }
  };

  return (
    <AuthenticationContext.Provider
      value={{
        checkUser,
        isStatePathExisted,
        setStatePath,
        getStorageTag,
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
      `useAuthentication must be used within a AuthenticationProvider`
    );
  }
  return context;
};

export const ManagedAuthenticationContext: FC<any> = ({ children }) => (
  <AuthenticationProvider>{children}</AuthenticationProvider>
);
