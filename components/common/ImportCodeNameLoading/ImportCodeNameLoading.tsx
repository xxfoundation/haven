import { FC, useState, useEffect } from "react";
import { useNetworkClient } from "contexts/network-client-context";
import { useUtils } from "contexts/utils-context";

import { Loading } from "@components/common";
import { ProgressBar } from "@components/common";
import { enc } from "utils";

const ImportCodeNameLoading: FC<{}> = ({}) => {
  const { utils, transferIdentittyVariables } = useUtils();

  const {
    isReadyToRegister,
    setIsReadyToRegister,
    checkIsRedayToRegister
  } = useNetworkClient();

  const [privateIdentity, setPrivateIdentity] = useState<any>(
    transferIdentittyVariables.current.privateIdentity || ""
  );

  const [password, setPassword] = useState<any>(
    transferIdentittyVariables.current.password || ""
  );

  const [readyProgress, setReadyProgress] = useState<number>(0);

  useEffect(() => {
    setTimeout(async () => {
      setIsReadyToRegister(false);
      const result = utils.ImportPrivateIdentity(
        password,
        enc.encode(privateIdentity)
      );

      checkIsRedayToRegister(result, (isReadyInfo: any) => {
        setReadyProgress(Math.ceil((isReadyInfo?.HowClose || 0) * 100));
      });
    }, 100);
  }, []);

  if (typeof isReadyToRegister === "undefined") {
    return <></>;
  } else if (!isReadyToRegister) {
    return (
      <Loading>
        <ProgressBar completed={readyProgress}></ProgressBar>
        <div className="text-center">
          <div className="headline--md">
            Securely setting up your codename. This could take up to a minute.
          </div>
          <div className="headline--sm">
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
