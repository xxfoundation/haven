import React, { FC, useState } from "react";

interface IUser {
  userName: string;
}

interface IUserSecret {
  userName: string;
  secret: string;
}

const usersStorageKey = "ELIXXIR_USERS";

export const AuthenticationContext = React.createContext<{
  currentUser: IUser | undefined;
  registerUser: Function;
  checkUser: Function;
}>({
  currentUser: undefined,
  registerUser: () => {},
  checkUser: () => {}
});

AuthenticationContext.displayName = "AuthenticationContext";

export const AuthenticationProvider: FC<any> = props => {
  const [currentUser, setCurrentUser] = useState<IUser | undefined>();

  const getStorageUsersSecrets = (): IUserSecret[] => {
    return JSON.parse(window.localStorage.getItem(usersStorageKey) || `[]`);
  };

  const addStorageUsersSecrets = (userSecret: IUserSecret) => {
    const oldSecrets = getStorageUsersSecrets();
    oldSecrets.push(userSecret);
    window.localStorage.setItem(usersStorageKey, JSON.stringify(oldSecrets));
  };

  const registerUser = (userName: string, password: string) => {
    if (userName && password) {
      setCurrentUser({ userName });
      addStorageUsersSecrets({ userName, secret: password });
    }
  };

  const checkUser = (userName: string, password: string) => {
    const secrets = getStorageUsersSecrets();
    const isRegistered =
      secrets.findIndex(s => s.userName === userName && password === s.secret) >
      -1;
    if (isRegistered) {
      setCurrentUser({ userName });
    }
    return isRegistered;
  };

  return (
    <AuthenticationContext.Provider
      value={{ currentUser, registerUser, checkUser }}
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
