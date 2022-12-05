import { FC, useState, useEffect } from 'react';
import cn from 'classnames';

import { ModalCtaButton } from 'src/components/common';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { Spinner } from 'src/components/common';
import { Loading } from 'src/components/common';
import { ProgressBar } from 'src/components/common';

import s from './CodeNameRegistration.module.scss';

const RegisterView2: FC = () => {
  const {
    checkIsRedayToRegister,
    generateIdentitiesObjects,
    isReadyToRegister,
    network,
    setIsReadyToRegister
  } = useNetworkClient();

  const [identities, setIdentites] = useState([]);
  const [selectedCodeName, setSelectedCodeName] = useState('');
  const [selectedPrivateIdentity, setSelectedPrivateIdentity] = useState('');
  const [firstTimeGenerated, setFirstTimeGenerated] = useState(false);

  const [readyProgress, setReadyProgress] = useState<number>(0);

  useEffect(() => {
    if (!firstTimeGenerated && network) {
      setIdentites(generateIdentitiesObjects(20));
      setFirstTimeGenerated(false);
    }
  }, [firstTimeGenerated, generateIdentitiesObjects, network]);

  if (typeof isReadyToRegister === 'undefined') {
    return (
      <div
        className={cn(
          'w-full flex flex-col justify-center items-center px-6',
          s.root
        )}
      >
        <h2 className='mt-9 mb-4'>Find your Codename</h2>
        <p
          className='mb-8 text text--sm'
          style={{
            color: 'var(--cyan)',
            lineHeight: '18px',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '800px',
            textAlign: 'center'
          }}
        >
          <span>
            Codenames are generated on your computer by you. No servers or
            databases are involved at all.
          </span>
          <br />
          <span>
            Your Codename is your personally owned anonymous identity shared
            across every Speakeasy you join. It is private and it can never be
            traced back to you.
          </span>
        </p>

        {identities.length ? (
          <div
            className={cn(
              'grid grid-cols-4 gap-x-4 gap-y-6 overflow-auto',
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
            <div className='w-full h-full flex justify-center items-center'>
              <Spinner />
            </div>
          </div>
        )}

        <div className='flex mb-5 mt-12'>
          <ModalCtaButton
            buttonCopy='Discover More'
            cssClass={s.generateButton}
            style={{
              backgroundColor: 'var(--black-1)',
              color: 'var(--orange)',
              borderColor: 'var(--orange)'
            }}
            onClick={() => {
              setIdentites(generateIdentitiesObjects(20));
            }}
            disabled={!network}
          />
          <ModalCtaButton
            buttonCopy='Claim'
            cssClass={s.registerButton}
            onClick={async () => {
              setIsReadyToRegister(false);
              setTimeout(async () => {
                checkIsRedayToRegister(
                  selectedPrivateIdentity,
                  (isReadyInfo: any) => {
                    setReadyProgress(
                      Math.ceil((isReadyInfo?.HowClose || 0) * 100)
                    );
                  }
                );
              }, 500);
            }}
            disabled={!network || selectedCodeName.length === 0}
          />
        </div>
      </div>
    );
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

export default RegisterView2;
