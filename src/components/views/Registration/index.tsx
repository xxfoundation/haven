import { FC, useCallback, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import cn from 'classnames';

import { Button, Spinner } from 'src/components/common';

import {
  NormalSpeakeasy,
  OpenSource,
  NormalHash,
  RoadMap,
} from 'src/components/icons';
import { useUI } from 'src/contexts/ui-context';

import s from './Registration.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDropbox, faGoogleDrive } from '@fortawesome/free-brands-svg-icons';
import { AccountSyncService } from 'src/hooks/useAccountSync';
import { useAuthentication } from '@contexts/authentication-context';
import Input from '@components/common/Input';

type Props = {
  onPasswordConfirmation: (password: string) => void;
};

const RegisterView: FC<Props> = ({ onPasswordConfirmation }) => {
  const { t } = useTranslation();
  const { openModal, setModalView } = useUI();
  const { setSyncLoginService } = useAuthentication();
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSelectServiceMenu, setShowSelectServiceMenu] = useState(false);

  const onContinue = useCallback(() => {
    if (passwordConfirm !== password) {
      setError(t('Password doesn\'t match confirmation.'));
    } else {
      if (password.length) {
        onPasswordConfirmation(password);
        setIsLoading(false);
      }
      setError('');
    }
  }, [passwordConfirm, password, t, onPasswordConfirmation])
  

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
              {t('Join the alpha')}
            </h2>
            {!showSelectServiceMenu && (
              <>
                <p
                  className='mb-8 text'
                  style={{ color: '#5B5D62', lineHeight: '17px' }}
                >
                  {t('Enter a password to secure your sovereign speakeasy identity')}
                </p>
                <Input
                  data-testid='registration-password-input'
                  type='password'
                  placeholder={t('Enter your password')}
                  className=''
                  value={password}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onContinue();
                    }
                  }}
                  onChange={e => {
                    setPassword(e.target.value);
                  }}
                />

                <Input
                  data-testid='registration-password-confirmation'
                  type='password'
                  placeholder={t('Confirm your password')}
                  className='mt-4'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onContinue();
                    }
                  }}
                  value={passwordConfirm}
                  onChange={e => {
                    setPasswordConfirm(e.target.value);
                  }}
                />

                {isLoading && (
                  <div className={s.loading}>
                    <Spinner />
                  </div>
                )}

                {error && (
                  <div
                    data-testid='registration-error'
                    className={'text text--xs mt-4'}
                    style={{ color: 'var(--red)' }}
                  >
                    {error}
                  </div>
                )}

                <div className='flex flex-col mt-4'>
                  <Button
                    data-testid='registration-button'
                    disabled={isLoading}
                    onClick={onContinue}
                  >
                    {t('Continue')}
                  </Button>
                </div>
                <div className='pt-3'>
                  {t('Already have an account?')}
                  <Trans t={t}>
                    <span
                      style={{
                        textDecoration: 'underline',
                        fontSize: '16px',
                        fontWeight: '500',
                        textAlign: 'center',
                        marginTop: '12px',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setModalView('IMPORT_CODENAME');
                        openModal();
                      }}
                    >
                      {t('Import')}
                    </span> an existing account or <span
                      style={{
                        textDecoration: 'underline',
                        fontSize: '16px',
                        fontWeight: '500',
                        textAlign: 'center',
                        marginTop: '12px',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setShowSelectServiceMenu(true);
                      }}
                    >
                      {t('login')}
                    </span> from a cloud provider.
                  </Trans>
                </div>
              </>
            )}
            {showSelectServiceMenu && (
              <>
                <p
                  className='mb-8 text'
                  style={{ color: '#5B5D62', lineHeight: '17px' }}
                >
                  {t('Select your cloud provider')}
                </p>
                <div className='flex flex-col space-y-3'>
                  <Button onClick={() => {
                    setSyncLoginService(AccountSyncService.Google);
                  }}>
                    Google Drive <FontAwesomeIcon icon={faGoogleDrive} />
                  </Button>
                  <Button onClick={() => {
                    setSyncLoginService(AccountSyncService.Dropbox);
                  }}>
                    Dropbox <FontAwesomeIcon icon={faDropbox} />
                  </Button>
                  <Button variant='secondary' onClick={() => { setShowSelectServiceMenu(false); }}>
                    Cancel
                  </Button>
                </div>
              </>
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

export default RegisterView;
