import { FC, useCallback, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Button, Spinner } from 'src/components/common';
import { NormalHaven, OpenSource, NormalHash } from 'src/components/icons';
import { useUI } from 'src/contexts/ui-context';
import Input from '@components/common/Input';

type Props = {
  onPasswordConfirmation: (password: string) => void;
};

const RegisterView: FC<Props> = ({ onPasswordConfirmation }) => {
  const { t } = useTranslation();
  const { openModal, setModalView } = useUI();
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSelectServiceMenu] = useState(false);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordConfirm !== password) {
        setError(t("Password doesn't match confirmation."));
      } else {
        if (password.length) {
          onPasswordConfirmation(password);
          setIsLoading(false);
        }
        setError('');
      }
    },
    [passwordConfirm, password, t, onPasswordConfirmation]
  );

  return (
    <div className='h-screen w-full flex flex-col relative items-center overflow-y-auto px-[60px]'>
      <div className='w-full flex flex-col justify-center items-center max-w-[1440px] flex-1'>
        <div className='mt-16 mb-[104px] w-full'>
          <NormalHaven data-testid='speakeasy-logo' />
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
                <span className='bg-secondary p-2 ml-3 font-bold text-[18px]'>
                  Talk about what you want.
                </span>
              </span>
            </Trans>
            <Trans>
              <span className='text-[18px] mt-[18px]'>
                Surveillance free. Censorship proof.
                <span className='bg-secondary p-2 ml-3 font-bold text-[18px]'>
                  Your Haven chats are yours.
                </span>
              </span>
            </Trans>
          </div>
          <div className='order-first mb-16 md:col-span-3 md:pl-3 md:order-none'>
            <h2 className='mb-2 font-medium'>{t('Join the alpha')}</h2>
            {!showSelectServiceMenu && (
              <form onSubmit={onSubmit}>
                <input
                  type='text'
                  autoComplete='username'
                  style={{ display: 'none' }}
                  aria-hidden='true'
                />
                <p className='mb-8 text-[#5B5D62] leading-[17px]'>
                  {t('Enter a password to secure your sovereign Haven identity')}
                </p>
                <Input
                  data-testid='registration-password-input'
                  type='password'
                  placeholder={t('Enter your password')}
                  value={password}
                  autoComplete='new-password'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onSubmit(e);
                    }
                  }}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />

                <Input
                  data-testid='registration-password-confirmation'
                  type='password'
                  placeholder={t('Confirm your password')}
                  value={passwordConfirm}
                  autoComplete='new-password'
                  className='mt-4'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onSubmit(e);
                    }
                  }}
                  onChange={(e) => {
                    setPasswordConfirm(e.target.value);
                  }}
                />

                {isLoading && (
                  <div className='flex justify-center items-center scale-40'>
                    <Spinner />
                  </div>
                )}

                {error && (
                  <div data-testid='registration-error' className='text-xs mt-4 text-red'>
                    {error}
                  </div>
                )}

                <div className='flex flex-col mt-4'>
                  <Button type='submit' data-testid='registration-button' disabled={isLoading}>
                    {t('Continue')}
                  </Button>
                </div>
                <div className='pt-3'>
                  {t('Already have an account?')}
                  <Trans t={t}>
                    <span
                      className='underline text-base font-medium text-center mt-3 cursor-pointer'
                      onClick={() => {
                        setModalView('IMPORT_CODENAME');
                        openModal();
                      }}
                    >
                      {t('Import')}
                    </span>{' '}
                    an existing account
                  </Trans>
                </div>
              </form>
            )}
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
          X
        </a>
      </div>
    </div>
  );
};

export default RegisterView;
