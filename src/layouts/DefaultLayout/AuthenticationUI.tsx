import React, { FC, useCallback, useEffect, useState } from 'react'

import { ImportCodeNameLoading } from 'src/components/common';
import { encoder } from 'src/utils/index';
import Register from 'src/components/views/Register';
import LoginView from '@components/views/Login';
import { IdentityVariables } from 'src/components/modals/ImportAccountView/types';
import ImportAccountModal from 'src/components/modals/ImportAccountView';
import { useUI } from 'src/contexts/ui-context';
import { useAuthentication } from '@contexts/authentication-context';
import { useUtils } from '@contexts/utils-context';
import { useNetworkClient } from '@contexts/network-client-context';

const AuthenticationUI: FC = () => {
  const { displayModal, modalView = '' } = useUI();
  const { attemptingSyncedLogin, cmixPreviouslyInitialized, getOrInitPassword, setIsAuthenticated } = useAuthentication();
  const { utils } = useUtils(); 
  const { checkRegistrationReadiness, cmix } = useNetworkClient();
  const [loading, setLoading] = useState(false); 
  const [readyProgress, setReadyProgress] = useState<number>(0);

  const hasAccount = cmixPreviouslyInitialized || attemptingSyncedLogin;
  const [importedIdentity, setImportedIdentity] = useState<Uint8Array>();
  
  const onImport = useCallback(async ({ identity, password }: IdentityVariables) =>  {
    setLoading(true);
    const imported = utils.ImportPrivateIdentity(password, encoder.encode(identity));
    setImportedIdentity(imported);
    getOrInitPassword(password);
  }, [getOrInitPassword, utils]);

  useEffect(() => {
    if (cmix && importedIdentity) {
      checkRegistrationReadiness(
        importedIdentity,
        (isReadyInfo) => {
          setReadyProgress(Math.ceil((isReadyInfo?.howClose || 0) * 100));
          if (isReadyInfo.isReady) {
            setLoading(false);  
            setReadyProgress(0);
            setIsAuthenticated(true);
          }
        }
      );
    }
  }, [checkRegistrationReadiness, cmix, importedIdentity, setIsAuthenticated])

  if (loading) {
    return (
      <ImportCodeNameLoading readyProgress={readyProgress}/>
    )
  }

  return (
    <>  
      {displayModal && modalView === 'IMPORT_CODENAME' &&  (
        <ImportAccountModal onSubmit={onImport} />
      )}
      
      {hasAccount ? <LoginView /> : <Register />}
    </>
  );
};

export default AuthenticationUI;
