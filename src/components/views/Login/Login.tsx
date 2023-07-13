import { FC, useCallback, useEffect, useState } from 'react';
import cn from 'classnames';
import { useTranslation, Trans } from 'react-i18next';

import { PrimaryButton, SecondaryButton, Spinner } from 'src/components/common';

import s from './Login.module.scss';

import {
  NormalSpeakeasy,
  OpenSource,
  NormalHash,
  RoadMap
} from 'src/components/icons';
import { useAuthentication } from '@contexts/authentication-context';
import useAccountSync, { AccountSyncService, AccountSyncStatus } from 'src/hooks/useAccountSync';
import GoogleButton from '@components/common/GoogleButton';
import DropboxButton from '@components/common/DropboxButton';
import { AppEvents, awaitAppEvent as awaitEvent, appBus as bus } from 'src/events';
import Input from '@components/common/Input';

const LoginView: FC = () => {
  const { t } = useTranslation();
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const {
    attemptingSyncedLogin,
    cancelSyncLogin,
    getOrInitPassword,
    setIsAuthenticated,
  } = useAuthentication();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState('');

  const { service: accountSyncService, status: accountSyncStatus } = useAccountSync();

  useEffect(() => {
    const listener = () => {
      setError(t('Something went wrong, please check your credentials.'));
      setIsLoading(false);
      setLoadingInfo('');
    }

    bus.addListener(AppEvents.NEW_SYNC_CMIX_FAILED, listener);

    return () => { bus.removeListener(AppEvents.NEW_SYNC_CMIX_FAILED, listener); }
  }, [t]);
  
  const handleSubmit = useCallback(async () => {
    setError('');
    setIsLoading(true);
    setTimeout(async () => {
      try {
        const success = await getOrInitPassword(password);
        if (success) {
          setIsAuthenticated(true);
        } else {
          setError(t('Something went wrong, please check your credentials.'));
        }
        setIsLoading(false);
      } catch (e) {
        setError((e as Error).message);
        setIsLoading(false);
      }
    }, 1);
  }, [getOrInitPassword, password, setIsAuthenticated, t]);

  const onSyncLoad = useCallback(async () => {
    setError('');
    setIsLoading(true);
    try {
      const success = await getOrInitPassword(password);
      if (!success) {
        setError(t('Something went wrong, please check your credentials.'));
        setIsLoading(false);
        return;
      }
      setLoadingInfo(t('Retrieving account...'));
      await awaitEvent(AppEvents.CMIX_SYNCED, undefined, 20000)
        .then(() => { setIsAuthenticated(true); })
        .catch(() => {
          console.error('Cmix Sync timed out.')
          setError(t('Something went wrong, please check your credentials.'));
        })
        .finally(() => {
          setIsLoading(false);
          setLoadingInfo('')
        });
    } catch (e) {
      setError((e as Error).message);
      setIsLoading(false);
    }
  }, [getOrInitPassword, password, setIsAuthenticated, t]);

  return (
    <div className={cn('', s.root)}>
      <div className={cn('w-full flex flex-col', s.wrapper)}>
        <div className={cn(s.header)}>
          <NormalSpeakeasy data-testid='speakeasy-logo' />
        </div>

        <div className={cn('grid grid-cols-12 gap-0', s.content)}>
          <div className='col-span-9 flex flex-col items-start'>
            <Trans>
              <span className={cn(s.golden)}>True Freedom</span>
              <span className={cn(s.thick)}>to express yourself,</span>
              <span className={cn(s.golden)}>your thoughts, your beliefs.</span>
              <span className={cn(s.normal)}>
                Speak easily to a group of friends or a global community.{' '}
                <span className={cn(s.highlighted)}>
                  Talk about what you want.
                </span>
              </span>
            </Trans>
            <Trans>
              <span className={cn(s.normal)}>
                Surveillance free. Censorship proof.
                <span className={cn(s.highlighted)}>
                  Your speakeasy is yours.
                </span>
              </span>
            </Trans>
          </div>
          <div className='col-span-3 pl-3'>
            <h2 className='mb-2'>
              {t('Login')}
            </h2>
            <p
              className='mb-8 text'
              style={{ color: '#5B5D62', lineHeight: '17px' }}
            >
              {t('Use your password to unlock your speakeasy identity')}
            </p>
            <Input
              data-testid='password-input'
              type='password'
              placeholder={t('Enter your password')}
              value={password}
              onChange={e => {
                setPassword(e.target.value);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (accountSyncStatus !== AccountSyncStatus.Synced) {
                    e.preventDefault();
                    handleSubmit();
                  }

                  if (accountSyncStatus === AccountSyncStatus.Synced && accountSyncService === AccountSyncService.Dropbox) {
                    const dropboxButton = document.getElementById('dropbox-button');
                    dropboxButton?.click();
                  }

                  if (accountSyncStatus === AccountSyncStatus.Synced && accountSyncService === AccountSyncService.Google) {
                    const googleButton = document.getElementById('google-auth-button');
                    googleButton?.click();
                  }
                }
              }}
            />
            <div className='flex flex-col mt-4 space-y-3'>
              {accountSyncStatus === AccountSyncStatus.Synced && accountSyncService === AccountSyncService.Google && (
                <GoogleButton
                  onError={() => setError(t('Something went wrong.'))}
                  onStartLoading={onSyncLoad}
                  disabled={isLoading}
                  password={password}
                />
              )}
              {accountSyncStatus === AccountSyncStatus.Synced && accountSyncService === AccountSyncService.Dropbox && (
                <DropboxButton
                  id='dropbox-button'
                  onError={() => setError(t('Something went wrong.'))}
                  onStartLoading={onSyncLoad}
                  disabled={isLoading}
                  password={password}
                />
              )}
              {accountSyncStatus !== AccountSyncStatus.Synced && (
                <PrimaryButton
                  data-testid='login-button'
                  disabled={isLoading}
                  className={s.button}
                  onClick={handleSubmit}
                >
                  {t('Login')}
                </PrimaryButton>
              )}
              {attemptingSyncedLogin && (
                <SecondaryButton onClick={cancelSyncLogin}>
                  Cancel
                </SecondaryButton>
              )}
            </div>
            {isLoading && (
              <div className={s.loading}>
                {loadingInfo && (
                  <p className='mt-4'>
                    {loadingInfo}
                  </p>
                )}
                <Spinner />
              </div>
            )}

            {error && (
              <div
                data-testid='login-error'
                style={{
                  color: 'var(--red)',
                  marginTop: '14px',
                  fontSize: '11px',

                  textAlign: 'center',
                  border: 'solid 1px #E3304B',
                  backgroundColor: 'rgba(227, 48, 75, 0.1)',
                  padding: '16px'
                }}
              >
                {error}
              </div>
            )}
          </div>
        </div>

        <div className={cn('grid grid-cols-12 gap-0', s.footer)}>
          <a
            href='https://www.speakeasy.tech/open-source/'
            target='_blank'
            rel='noreferrer'
            className={cn('flex flex-col col-span-4', s.perkCard)}
          >
            <OpenSource />
            <span className={cn(s.perkCard__title)}>
              {t('Open Source')}
            </span>
            <span className={cn(s.perkCard__description)}>
              {t('Every line — open source. Forever.')}
            </span>
          </a>
          <a
            href='https://www.speakeasy.tech/how-it-works/'
            target='_blank'
            rel='noreferrer'
            className={cn('flex flex-col col-span-4', s.perkCard)}
          >
            <NormalHash />
            <span className={cn(s.perkCard__title)}>
              {t('Fundamentally Different')}
            </span>
            <span className={cn(s.perkCard__description)}>
              {t('Powered by the first decentralized mixnet-blockchain')}
            </span>
          </a>
          <a
            href='https://www.speakeasy.tech/roadmap/'
            target='_blank'
            rel='noreferrer'
            className={cn('flex flex-col col-span-4', s.perkCard)}
          >
            <RoadMap />
            <span className={cn(s.perkCard__title)}>
              {t('Roadmap')}
            </span>
            <span className={cn(s.perkCard__description)}>
              {t('Building to the future')}
            </span>
          </a>
        </div>
      </div>
      <div className={cn(s.links)}>
        <a href='https://xx.network/' target='_blank' rel='noreferrer'>
          {t('xx network')}
        </a>
        <a
          href='https://www.speakeasy.tech/privacy-policy/'
          target='_blank'
          rel='noreferrer'
        >
          {t('Privacy Policy')}
        </a>

        <a
          href='https://www.speakeasy.tech/terms-of-use/'
          target='_blank'
          rel='noreferrer'
        >
          {t('Terms of Use')}
        </a>

        <a href='https://xxfoundation.org/' target='_blank' rel='noreferrer'>
          {t('xx foundation')}
        </a>
        <a href='https://elixxir.io/' target='_blank' rel='noreferrer'>
          {t('xx messenger')}
        </a>
        <a
          href='https://twitter.com/speakeasy_tech'
          target='_blank'
          rel='noreferrer'
        >
          Twitter
        </a>
      </div>
    </div>
  );
};

export default LoginView;
