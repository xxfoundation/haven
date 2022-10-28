import { FC, useState, useEffect, useRef } from "react";
import s from "./ImportCodenameView.module.scss";
import { ModalCtaButton } from "@components/common";
import cn from "classnames";
import { useNetworkClient } from "contexts/network-client-context";
import { useUI } from "contexts/ui-context";
import { useUtils } from "contexts/utils-context";
import { enc } from "utils";
import { Spinner } from "@components/common";
import { Upload } from "@components/icons";
import { Loading } from "@components/common";
import { ProgressBar } from "@components/common";

const ImportCodenameView: FC<{}> = ({}) => {
  const { closeModal } = useUI();
  const {
    initiateCmix,
    network,
    isReadyToRegister,
    setIsReadyToRegister,
    checkIsRedayToRegister
  } = useNetworkClient();
  const fileInputLabelRef = useRef<HTMLSpanElement>(null);
  // const [readyProgress, setReadyProgress] = useState<number>(0);

  const { utils, transferIdentittyVariables } = useUtils();
  const [password, setPassword] = useState<string>(
    transferIdentittyVariables.current.password || ""
  );
  const [privateIdentity, setPrivateIdentity] = useState<any>(
    transferIdentittyVariables.current.privateIdentity || ""
  );
  const [error, setError] = useState(
    transferIdentittyVariables.current.error || ""
  );

  const [isLoading, setIsLoading] = useState<boolean>(
    transferIdentittyVariables.current.isLoading || false
  );

  const [readyProgress, setReadyProgress] = useState<number>(
    transferIdentittyVariables.current.readyProgress || 0
  );

  // const [checkIsReadyCalled, setCheckIsReadyCalled] = useState<boolean>(
  //   transferIdentittyVariables.current.checkIsReadyCalled || false
  // );

  useEffect(() => {
    if (isReadyToRegister) {
      // transferIdentittyVariables.current = {};
      closeModal();
    }
  }, []);

  useEffect(() => {
    if (network && privateIdentity && password) {
      const result = utils.ImportPrivateIdentity(
        password,
        enc.encode(privateIdentity)
      );

      // setIsReadyToRegister(false);
      if (!transferIdentittyVariables?.current?.checkIsReadyCalled) {
        transferIdentittyVariables.current.checkIsReadyCalled = true;
        // setCheckIsReadyCalled(true);
        setTimeout(async () => {
          console.log("Test 2222");
          setIsReadyToRegister(false);

          checkIsRedayToRegister(result, (isReadyInfo: any) => {
            console.log("Test 6666", isReadyInfo);
            transferIdentittyVariables.current.readyProgress = Math.ceil(
              (isReadyInfo?.HowClose || 0) * 100
            );
            setReadyProgress(Math.ceil((isReadyInfo?.HowClose || 0) * 100));
            // setReadyProgress(Math.ceil((isReadyInfo?.HowClose || 0) * 100));
          });
        }, 500);
      }

      // createChannelManager(result);
      // transferIdentittyVariables.current = {
      //   readyProgress: transferIdentittyVariables?.current?.readyProgress || 0
      // };
      // closeModal();
    }
  }, [password, privateIdentity]);

  const handleSubmit = () => {
    setError("");
    if (
      password &&
      privateIdentity &&
      utils &&
      utils.ImportPrivateIdentity &&
      utils.GetOrInitPassword
    ) {
      try {
        utils.ImportPrivateIdentity(password, enc.encode(privateIdentity));
        initiateCmix(password);
        transferIdentittyVariables.current = {
          ...transferIdentittyVariables.current,
          isLoading: true
        };
        setIsLoading(true);
      } catch (error) {
        setError("Incorrect file and/or password");
      }
    }
  };

  const readFile = async (e: any) => {
    const targetFile = e.target.files[0];

    e.preventDefault();
    if (
      fileInputLabelRef &&
      fileInputLabelRef.current &&
      targetFile &&
      targetFile.name
    ) {
      fileInputLabelRef.current.innerText = targetFile.name;
    }
    const reader = new FileReader();
    reader.onload = async e => {
      const fileContent = e?.target?.result;
      transferIdentittyVariables.current = {
        ...transferIdentittyVariables.current,
        privateIdentity: fileContent
      };
      setPrivateIdentity(fileContent as string);
    };
    if (targetFile) {
      reader.readAsText(e.target.files[0]);
    }
  };

  if (typeof isReadyToRegister === "undefined") {
    return (
      <div className={cn("w-full flex flex-col items-center", s.root)}>
        <h2 className="mt-9 mb-4">Import your account</h2>
        <p className="mb-8">
          Note that importing your account will only restore your codename. You
          need to rejoin manually any previously joined channel
        </p>
        {isLoading ? (
          <div className="mt-20">
            <Spinner />
          </div>
        ) : (
          <>
            <input
              id="identityFile"
              type="file"
              placeholder="Choose a file "
              onChange={e => {
                readFile(e);
              }}
            />
            <label htmlFor="identityFile" className="flex justify-between">
              <span ref={fileInputLabelRef}>Choose a file</span>
              <Upload />
            </label>
            <input
              type="password"
              placeholder="Unlock export with your password"
              value={password}
              onChange={e => {
                transferIdentittyVariables.current = {
                  ...transferIdentittyVariables.current,
                  password: e.target.value
                };
                setPassword(e.target.value);
              }}
            />
            {error && (
              <div
                className={"text text--xs mt-2"}
                style={{ color: "var(--red)" }}
              >
                {error}
              </div>
            )}
            <ModalCtaButton
              buttonCopy="Import"
              cssClass={cn("mt-5", s.button)}
              onClick={handleSubmit}
            />
          </>
        )}
      </div>
    );
  } else if (!isReadyToRegister) {
    console.log("Test 1111");
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

export default ImportCodenameView;
