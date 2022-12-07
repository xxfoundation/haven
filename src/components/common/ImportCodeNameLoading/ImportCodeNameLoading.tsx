import { FC, useMemo, useState, useEffect } from 'react';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { useUtils } from 'src/contexts/utils-context';

import { Loading } from 'src/components/common';
import { ProgressBar } from 'src/components/common';
import { encoder } from 'src/utils';

const ImportCodeNameLoading: FC = () => {
  const { transferIdentityVariables, utils } = useUtils();

  const {
    checkRegistrationReadiness,
    isReadyToRegister,
    setIsReadyToRegister
  } = useNetworkClient();

  const privateIdentity = useMemo(
    () => transferIdentityVariables.current.privateIdentity || '',
    [transferIdentityVariables]
  );
  const password = useMemo(
    () => transferIdentityVariables.current.password || '',
    [transferIdentityVariables]
  );

  const [readyProgress, setReadyProgress] = useState<number>(0);

  useEffect(() => {
    setTimeout(async () => {
      setIsReadyToRegister(false);
      const imported = utils.ImportPrivateIdentity(
        password,
        encoder.encode(privateIdentity)
      );

      checkRegistrationReadiness(
        imported,
        (isReadyInfo) => {
          setReadyProgress(Math.ceil((isReadyInfo?.HowClose || 0) * 100));
        }
      );
    }, 100);
  }, [
    checkRegistrationReadiness,
    password,
    privateIdentity,
    setIsReadyToRegister,
    utils
  ]);

  if (typeof isReadyToRegister === 'undefined') {
    return <></>;
  } else if (!isReadyToRegister) {
    return (
      <Loading>
        <ProgressBar completed={readyProgress}></ProgressBar>
        <div className='text-center'>
          <div className='headline--md'>
            Securely setting up your codename. This could take up to a minute.
          </div>
          <div className='headline--sm'>
            Please do not close this page - your codename may be lost
          </div>
        </div>
      </Loading>
    );
  } else {
    return null;
  }
};

export default ImportCodeNameLoading;
