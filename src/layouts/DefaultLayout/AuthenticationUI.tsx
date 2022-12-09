import React, { FC, useCallback, useEffect, useState } from 'react'

import { ImportCodeNameLoading } from 'src/components/common';
import { encoder } from 'src/utils/index';
import Register from 'src/components/views/Register';
import LoginView from '@components/views/Login';
import { IdentityVariables } from '@components/common/Modal/ModalViews/ImportAccountView/types';
import ImportAccountModal from '@components/common/Modal/ModalViews/ImportAccountView';
import { useUI } from 'src/contexts/ui-context';
import { useAuthentication } from '@contexts/authentication-context';
import { useUtils } from '@contexts/utils-context';
import { useNetworkClient } from '@contexts/network-client-context';

const AuthenticationUI: FC = () => {
  const { displayModal, modalView = '' } = useUI();
  const { getStorageTag, statePathExists } = useAuthentication();
  const { utils } = useUtils(); 
  const { checkRegistrationReadiness, cmix, initiateCmix, setIsReadyToRegister } = useNetworkClient();
  const [loading, setLoading] = useState(false); 
  const [readyProgress, setReadyProgress] = useState<number>(0);
  const hasAccount = statePathExists() && getStorageTag();
  const [importedIdentity, setImportedIdentity] = useState<Uint8Array>();

  const onSubmit = useCallback(async ({ identity, password }: IdentityVariables) =>  {
      setLoading(true);
      setIsReadyToRegister(false);
      const imported = utils.ImportPrivateIdentity(password, encoder.encode(identity));
      setImportedIdentity(imported);
      await initiateCmix(password);
  }, [initiateCmix, setIsReadyToRegister, utils]);

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
