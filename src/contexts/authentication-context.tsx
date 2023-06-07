import { WithChildren } from '@types';

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { STATE_PATH } from '../constants';
import { useUtils } from 'src/contexts/utils-context';
import { v4 as uuid } from 'uuid';
import useAccountSync, { AccountSyncService, AccountSyncStatus } from 'src/hooks/useAccountSync';

type AuthenticationContextType = {
  setSyncLoginService: (service: AccountSyncService) => void;
  cancelSyncLogin: () => void;
  cmixPreviouslyInitialized: boolean;
  attemptingSyncedLogin: boolean;
  getOrInitPassword: (password: string) => boolean;
  encryptedPassword?: Uint8Array;
  rawPassword?: string;
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
  const authChannel = useMemo<BroadcastChannel>(() => new BroadcastChannel('authentication'), []);
  const [encryptedPassword, setEncryptedPassword] = useState<Uint8Array>();
  const [rawPassword, setRawPassword] = useState<string>();
  const {
    setService: setAccountSyncService,
    setStatus: setAccountSyncStatus,
    status: accountSyncStatus
  } = useAccountSync();

  const setSyncLoginService = useCallback((service: AccountSyncService) => {
    setAccountSyncService(service);
    setAccountSyncStatus(AccountSyncStatus.Synced);
  }, [setAccountSyncService, setAccountSyncStatus]);

  const cancelSyncLogin = useCallback(() => {
    setAccountSyncStatus(AccountSyncStatus.NotSynced);
    setAccountSyncService(AccountSyncService.None);
  }, [setAccountSyncService, setAccountSyncStatus]);

  const getOrInitPassword = useCallback((password: string) => {
    try {
      setRawPassword(password);
      const encrypted = utils.GetOrInitPassword(password);
      setEncryptedPassword(encrypted);
      return true;
    } catch (error) {
      console.error('GetOrInitPassword failed', error);
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
  }, [authChannel, isAuthenticated, instanceId]);

  const cmixPreviouslyInitialized = statePathExists();

  return (
    <AuthenticationContext.Provider
      value={{
        setSyncLoginService,
        cancelSyncLogin,
        cmixPreviouslyInitialized,
        encryptedPassword,
        attemptingSyncedLogin: !cmixPreviouslyInitialized && accountSyncStatus === AccountSyncStatus.Synced,
        getOrInitPassword,
        instanceId,
        rawPassword,
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
