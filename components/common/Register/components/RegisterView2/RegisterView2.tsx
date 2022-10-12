import { FC, useState, useEffect } from "react";
import s from "./RegisterView2.module.scss";
import { ModalCtaButton } from "@components/common";
import cn from "classnames";
import { useNetworkClient } from "contexts/network-client-context";
import { Spinner } from "@components/common";

const RegisterView2: FC<{}> = ({}) => {
  const {
    generateIdentitiesObjects,
    isNetworkLoading,
    network,
    createChannelManager
  } = useNetworkClient();

  const [identities, setIdentites] = useState([]);
  const [selectedCodeName, setSelectedCodeName] = useState("");
  const [selectedPrivateIdentity, setSelectedPrivateIdentity] = useState("");
  const [firstTimeGenerated, setFirstTimeGenerated] = useState(false);

  useEffect(() => {
    if (!firstTimeGenerated && network) {
      setIdentites(generateIdentitiesObjects(20));
      setFirstTimeGenerated(false);
    }
  }, [network]);

  return (
    <div
      className={cn(
        "w-full flex flex-col justify-center items-center px-6",
        s.root
      )}
    >
      <h2 className="mt-9 mb-4">Find your Codename</h2>

      <p
        className="mb-8 text text--sm"
        style={{
          color: "var(--cyan)",
          lineHeight: "15px",
          maxWidth: "444px",
          textAlign: "center"
        }}
      >
        Your unique codename allows anyone to know they are talking to you.
        Codenames are private, only those you are talking to ever know your
        codename.
      </p>

      {identities.length ? (
        <div
          className={cn(
            "grid grid-cols-4 gap-x-4 gap-y-6 overflow-auto",
            s.codeContainers
          )}
        >
          {identities.map((i: any) => {
            return (
              <div
                key={i.codeName}
                className={cn(s.codeName, {
                  [s.codeName__selected]: i.codeName === selectedCodeName
                })}
                onClick={() => {
                  setSelectedCodeName(i.codeName);
                  setSelectedPrivateIdentity(i.privateIdentity);
                }}
              >
                <span>{i.codeName}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={s.loading}>
          <div className="w-full h-full flex justify-center items-center">
            <Spinner />
          </div>
        </div>
      )}

      <div className="flex mb-5 mt-12">
        <ModalCtaButton
          buttonCopy="Discover More"
          cssClass={s.generateButton}
          style={{
            backgroundColor: "var(--black-1)",
            color: "var(--orange)",
            borderColor: "var(--orange)"
          }}
          onClick={() => {
            setIdentites(generateIdentitiesObjects(20));
          }}
          disabled={!network}
        />
        <ModalCtaButton
          buttonCopy="Claim"
          cssClass={s.registerButton}
          onClick={() => {
            createChannelManager(selectedPrivateIdentity);
          }}
          disabled={!network || selectedCodeName.length === 0}
        />
      </div>
    </div>
  );
};

export default RegisterView2;
