import { FC, useCallback, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import cn from 'classnames';

import { ModalCtaButton, Spinner } from 'src/components/common';

import {
  NormalSpeakeasy,
  OpenSource,
  NormalHash,
  RoadMap,
} from 'src/components/icons';
import { useUI } from 'src/contexts/ui-context';

import s from './Registration.module.scss';

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

  const onContinue = useCallback(() => {
    if (passwordConfirm !== password) {
      setError(t('Password doesn\'t match confirmation.'));
    } else {
      if (password.length) {
        setIsLoading(true);
        setTimeout(() => {
          onPasswordConfirmation(password);
          setIsLoading(false);
        }, 200);
      }
      setError('');
    }
  }, [t, onPasswordConfirmation, password, passwordConfirm])
  

  return (
    <div className={cn('', s.root)}>
      <div className={cn('w-full flex flex-col', s.wrapper)}>
        <div className={cn(s.header)}>
          <NormalSpeakeasy />
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
            <p
              className='mb-8 text'
              style={{ color: '#5B5D62', lineHeight: '17px' }}
            >
              {t('Enter a password to secure your sovereign speakeasy identity')}
            </p>
            <input
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

            <input
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
                className={'text text--xs mt-4'}
                style={{ color: 'var(--red)' }}
              >
                {error}
              </div>
            )}

            <div className='flex flex-col mt-4'>
              <ModalCtaButton
                buttonCopy={t('Continue')}
                cssClass={s.button}
                disabled={isLoading}
                onClick={onContinue}
              />

              <div
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
                {t('Already have a codename?')}
              </div>
            </div>
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
