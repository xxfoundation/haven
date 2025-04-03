import { FC, useCallback, useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Button, Spinner } from 'src/components/common';
import { NormalHaven, OpenSource, NormalHash } from 'src/components/icons';
import { useAuthentication } from '@contexts/authentication-context';
import useAccountSync, { AccountSyncService, AccountSyncStatus } from 'src/hooks/useAccountSync';
import { AppEvents, appBus as bus } from 'src/events';
import Input from '@components/common/Input';

const LoginView: FC = () => {
  const { t } = useTranslation();
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { attemptingSyncedLogin, cancelSyncLogin, getOrInitPassword, setIsAuthenticated } =
    useAuthentication();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState('');

  const { service: accountSyncService, status: accountSyncStatus } = useAccountSync();

  useEffect(() => {
    const listener = () => {
      setError(t('Something went wrong, please check your credentials.'));
      setIsLoading(false);
      setLoadingInfo('');
    };

    bus.addListener(AppEvents.NEW_SYNC_CMIX_FAILED, listener);
    return () => {
      bus.removeListener(AppEvents.NEW_SYNC_CMIX_FAILED, listener);
    };
  }, [t]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
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
    },
    [getOrInitPassword, password, setIsAuthenticated, t]
  );

  return (
    <div className='h-screen w-full flex flex-col relative items-center overflow-y-auto px-12 md:px-[3.75rem]'>
      <div className='w-full flex flex-col justify-center items-center max-w-[1440px] flex-1'>
        <div className='my-16 w-full md:mt-16 md:mb-[6.5rem]'>
          <NormalHaven data-testid='haven-logo' />
        </div>
        <div className='w-full mb-[120px] grid grid-cols-1 gap-0 md:grid-cols-12'>
          <div className='col-span-9 flex flex-col items-start'>
            <Trans>
              <span className='text-[48px] text-[#ecba60] font-thin leading-[1.1]'>
                True Freedom
              </span>
              <span className='text-[48px] font-bold leading-[1.1]'>to express yourself,</span>
              <span className='text-[48px] text-[#ecba60] font-thin leading-[1.1]'>
                your thoughts, your beliefs.
              </span>
              <span className='text-[18px] mt-[18px]'>
                Speak easily to a group of friends or a global community.{' '}
                <span className='bg-cyan p-2 ml-3 font-bold text-[18px]'>
                  Talk about what you want.
                </span>
              </span>
            </Trans>
            <Trans>
              <span className='text-[18px] mt-[18px]'>
                Surveillance free. Censorship proof.
                <span className='bg-cyan p-2 ml-3 font-bold text-[18px]'>
                  Your Haven chats are yours.
                </span>
              </span>
            </Trans>
          </div>
          <div className='order-first mb-16 md:col-span-3 md:pl-3 md:order-none'>
            <h2 className='mb-2 font-medium'>{t('Login')}</h2>
            <p className='mb-8 text-[#5B5D62] leading-[17px]'>
              {t('Use your password to unlock your Haven identity')}
            </p>
            <form onSubmit={handleSubmit} className='w-full'>
              <input
                type='text'
                autoComplete='username'
                style={{ display: 'none' }}
                aria-hidden='true'
              />
              <Input
                data-testid='password-input'
                type='password'
                placeholder={t('Enter your password')}
                value={password}
                autoComplete='current-password'
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (accountSyncStatus !== AccountSyncStatus.Synced) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }
                }}
                className='[&_input:-webkit-autofill]:shadow-[0_0_0_30px_var(--dark-5)_inset] [&_input:-webkit-autofill]:-webkit-text-fill-color-[var(--text-primary)]'
              />
              <div className='flex flex-col mt-4 space-y-3'>
                {accountSyncStatus !== AccountSyncStatus.Synced && (
                  <Button
                    type='submit'
                    data-testid='login-button'
                    disabled={isLoading}
                    className='rounded-lg font-bold text-sm'
                  >
                    {t('Login')}
                  </Button>
                )}
                {attemptingSyncedLogin && (
                  <Button variant='secondary' onClick={cancelSyncLogin}>
                    Cancel
                  </Button>
                )}
              </div>
              {isLoading && (
                <div className='text-center'>
                  {loadingInfo && <p className='mt-4'>{loadingInfo}</p>}
                  <Spinner />
                </div>
              )}

              {error && (
                <div
                  data-testid='login-error'
                  className='mt-[14px] text-[11px] text-center border border-red bg-red/10 p-4'
                >
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
        <div className='w-full grid grid-cols-12 gap-0'>
          <a
            href='https://git.xx.network/elixxir/speakeasy-web'
            target='_blank'
            rel='noreferrer'
            className='flex flex-col col-span-6 md:col-span-4 p-[36px_28px_28px_28px] bg-white/[0.04]'
          >
            <OpenSource />
            <span className='font-bold text-base leading-5 mt-[22px] mb-2 text-white'>
              {t('Open Source')}
            </span>
            <span className='font-medium text-xs leading-[15px] text-[#5b5d62]'>
              {t('Every line — open source. Forever.')}
            </span>
          </a>
          <a
            href='https://learn.xx.network/'
            target='_blank'
            rel='noreferrer'
            className='flex flex-col col-span-6 md:col-span-4 p-[36px_28px_28px_28px] bg-white/[0.03]'
          >
            <NormalHash />
            <span className='font-bold text-base leading-5 mt-[22px] mb-2 text-white'>
              {t('Fundamentally Different')}
            </span>
            <span className='font-medium text-xs leading-[15px] text-[#5b5d62]'>
              {t('Powered by the first decentralized mixnet-blockchain')}
            </span>
          </a>
        </div>
      </div>
      <div className='w-full mt-8 pb-[6px] flex justify-center flex-wrap gap-y-3 xs:flex-row'>
        <a
          href='https://xx.network/'
          target='_blank'
          rel='noreferrer'
          className="font-['Montserrat'] text-xs leading-[15px] text-[#2e3137] mx-5 whitespace-nowrap hover:text-white"
        >
          {t('xx network')}
        </a>
        <a
          href='https://xx.network/privacy-policy/'
          target='_blank'
          rel='noreferrer'
          className="font-['Montserrat'] text-xs leading-[15px] text-[#2e3137] mx-5 whitespace-nowrap hover:text-white"
        >
          {t('Privacy Policy')}
        </a>
        <a
          href='https://xx.network/terms-of-use/'
          target='_blank'
          rel='noreferrer'
          className="font-['Montserrat'] text-xs leading-[15px] text-[#2e3137] mx-5 whitespace-nowrap hover:text-white"
        >
          {t('Terms of Use')}
        </a>
        <a
          href='https://xxfoundation.org/'
          target='_blank'
          rel='noreferrer'
          className="font-['Montserrat'] text-xs leading-[15px] text-[#2e3137] mx-5 whitespace-nowrap hover:text-white"
        >
          {t('xx foundation')}
        </a>
        <a
          href='https://x.com/xx_network'
          target='_blank'
          rel='noreferrer'
          className="font-['Montserrat'] text-xs leading-[15px] text-[#2e3137] mx-5 whitespace-nowrap hover:text-white"
        >
          Twitter
        </a>
      </div>
    </div>
  );
};

export default LoginView;
