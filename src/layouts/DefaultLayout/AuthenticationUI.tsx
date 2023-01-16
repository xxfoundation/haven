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
  const { statePathExists, storageTag } = useAuthentication();
  const { utils } = useUtils(); 
  const { checkRegistrationReadiness, cmix, initialize, setIsReadyToRegister } = useNetworkClient();
  const [loading, setLoading] = useState(false); 
  const [readyProgress, setReadyProgress] = useState<number>(0);
  const hasAccount = statePathExists() && storageTag;

  const [importedIdentity, setImportedIdentity] = useState<Uint8Array>();

  const onSubmit = useCallback(async ({ identity, password }: IdentityVariables) =>  {
      setLoading(true);
      setIsReadyToRegister(false);
      const imported = utils.ImportPrivateIdentity(password, encoder.encode(identity));
      setImportedIdentity(imported);
      await initialize(password);
  }, [initialize, setIsReadyToRegister, utils]);

  useEffect(() => {
    if (cmix && importedIdentity) {
      checkRegistrationReadiness(
        importedIdentity,
        (isReadyInfo) => {
          setReadyProgress(Math.ceil((isReadyInfo?.HowClose || 0) * 100));
        }
      ).then(() => {
        setLoading(false);  
        setReadyProgress(0);
        setIsReadyToRegister(true);
      });
    }
  }, [checkRegistrationReadiness, cmix, importedIdentity, setIsReadyToRegister])

  if (loading) {
    return (
      <ImportCodeNameLoading readyProgress={readyProgress}/>
    )
  }

  return (
    <>  
      {displayModal && modalView === 'IMPORT_CODENAME' &&  (
        <ImportAccountModal onSubmit={onSubmit} />
      )}
      {hasAccount ? <LoginView /> : <Register />}
    </>
  );
};

export default AuthenticationUI;
