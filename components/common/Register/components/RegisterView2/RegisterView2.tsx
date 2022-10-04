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
      className={cn("w-full flex flex-col justify-center items-center", s.root)}
    >
      <h2 className="mt-9 mb-4">Registration </h2>

      <p
        className="mb-8 text"
        style={{ color: "var(--cyan)", lineHeight: "13px" }}
      >
        Choose a code name that will be unique to your account. You can later
        use a nickname you choose for each channel.
      </p>

      {identities.length ? (
        <div className={cn("grid grid-cols-4 gap-4", s.codeContainers)}>
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
                {i.codeName}
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

      <div className="flex my-5">
        <ModalCtaButton
          buttonCopy="Give me more"
          cssClass={s.generateButton}
          style={{
            backgroundColor: "var(--dark-1)",
            color: "var(--orange)",
            borderColor: "var(--orange)"
          }}
          onClick={() => {
            setIdentites(generateIdentitiesObjects(20));
          }}
          disabled={isNetworkLoading || !network}
        />
        <ModalCtaButton
          buttonCopy="Register"
          cssClass={s.registerButton}
          onClick={() => {
            createChannelManager(selectedPrivateIdentity);
          }}
          disabled={
            isNetworkLoading || !network || selectedCodeName.length === 0
          }
        />
      </div>
    </div>
  );
};

export default RegisterView2;
