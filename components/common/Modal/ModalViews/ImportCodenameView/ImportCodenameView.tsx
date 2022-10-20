import { FC, useState, useEffect, useRef } from "react";
import s from "./ImportCodenameView.module.scss";
import { ModalCtaButton } from "@components/common";
import cn from "classnames";
import {
  useNetworkClient,
  NetworkStatus
} from "contexts/network-client-context";
import { useUI } from "contexts/ui-context";
import { useUtils } from "contexts/utils-context";
import { enc } from "utils";
import { Spinner } from "@components/common";
import { Upload } from "@components/icons";

const ImportCodenameView: FC<{}> = ({}) => {
  const { closeModal } = useUI();
  const {
    exportPrivateIdentity,
    initiateCmix,
    createChannelManager,
    network,
    networkStatus
  } = useNetworkClient();
  const fileInputLabelRef = useRef<HTMLSpanElement>(null);

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

  useEffect(() => {
    if (
      networkStatus === NetworkStatus.CONNECTED &&
      privateIdentity &&
      password
    ) {
      const result = utils.ImportPrivateIdentity(
        password,
        enc.encode(privateIdentity)
      );
      createChannelManager(result);
      transferIdentittyVariables.current = {};
      closeModal();
    }
  }, [networkStatus, password, privateIdentity]);

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
};

export default ImportCodenameView;
