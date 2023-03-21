import { FC, useState, useEffect, useCallback } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import { ImportCodeNameLoading, ModalCtaButton } from 'src/components/common';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { Spinner } from 'src/components/common';

import s from './CodeNameRegistration.module.scss';
import Identity from 'src/components/common/Identity';

const CodenameRegistration: FC = () => {
  const { t } = useTranslation();
  const {
    checkRegistrationReadiness,
    cmix,
    generateIdentities
  } = useNetworkClient();
  const [loading, setLoading] = useState(false);
  const [identities, setIdentites] = useState<ReturnType<typeof generateIdentities>>([]);
  const [selectedCodeName, setSelectedCodeName] = useState('');
  const [selectedPrivateIdentity, setSelectedPrivateIdentity] = useState<Uint8Array>();
  const [firstTimeGenerated, setFirstTimeGenerated] = useState(false);

  const [readyProgress, setReadyProgress] = useState<number>(0);

  useEffect(() => {
    if (!firstTimeGenerated && cmix) {
      setIdentites(generateIdentities(20));
      setFirstTimeGenerated(false);
    }
  }, [firstTimeGenerated, generateIdentities, cmix]);

  const register = useCallback(async () => {
    setLoading(true);
    setTimeout(async () => {
      if (selectedPrivateIdentity) {
        checkRegistrationReadiness(
          selectedPrivateIdentity,
          (isReadyInfo) => {
            if (isReadyInfo.isReady) {
              setTimeout(() => {
                setLoading(false);
                // Dont mess with this, it needs exactly 3 seconds
                // for the database to initialize
              }, 3000)
            }
            setReadyProgress(
              Math.ceil((isReadyInfo?.howClose || 0) * 100)
            );
          }
        );
      }
      
    }, 500);
  }, [checkRegistrationReadiness, selectedPrivateIdentity]);

  return loading ? <ImportCodeNameLoading fullscreen readyProgress={readyProgress} /> : (
    <div
      className={cn(
        'w-full flex flex-col justify-center items-center px-6',
        s.root
      )}
    >
      <h2 className='mt-9 mb-4'>
        {t('Find your Codename')}
      </h2>
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
          {t(`
            Codenames are generated on your computer by you. No servers or
            databases are involved at all.
          `)}
        </span>
        <br />
        <span>
          {t(`
            Your Codename is your personally owned anonymous identity shared
            across every Speakeasy you join. It is private and it can never be
            traced back to you.
          `)}
        </span>
      </p>

      {identities.length ? (
        <div
          className={cn(
            'grid grid-cols-4 gap-x-4 gap-y-6 overflow-auto',
            s.codeContainers
          )}
        >
          {identities.map((i) => (
            <div
              key={i.codename}
              className={cn(s.codename, {
                [s.selected]: i.codename === selectedCodeName
              })}
              onClick={() => {
                setSelectedCodeName(i.codename);
                setSelectedPrivateIdentity(i.privateIdentity);
              }}
            >
              <span className='text-xs'>
                <Identity className={s.identity} {...i} />
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className={s.loading}>
          <div className='w-full h-full flex justify-center items-center'>
            <Spinner size='lg' />
          </div>
        </div>
      )}

      <div className='flex mb-5 mt-12'>
        <ModalCtaButton
          buttonCopy={t('Discover More')}
          cssClass={s.generateButton}
          style={{
            backgroundColor: 'var(--black-1)',
            color: 'var(--orange)',
            borderColor: 'var(--orange)'
          }}
          onClick={() => {
            setSelectedCodeName('');
            setIdentites(generateIdentities(20));
          }}
          disabled={!cmix}
        />
        <ModalCtaButton
          buttonCopy={t('Claim')}
          cssClass={s.registerButton}
          onClick={register}
          disabled={!cmix || selectedCodeName.length === 0}
        />
      </div>
    </div>
  );
};

export default CodenameRegistration;
