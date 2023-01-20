import { FC, useCallback, useState } from 'react';
import cn from 'classnames';

import { ModalCtaButton, Spinner } from 'src/components/common';
import { useNetworkClient } from 'src/contexts/network-client-context';

import s from './Login.module.scss';

import {
  NormalSpeakeasy,
  OpenSource,
  NormalHash,
  RoadMap
} from 'src/components/icons';
import { useAuthentication } from '@contexts/authentication-context';

const LoginView: FC = ({}) => {
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const {
    initialize
  } = useNetworkClient();
  const { setIsAuthenticated } = useAuthentication();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    setError('');
    setIsLoading(true);
      setTimeout(async () => {
        try {
          await initialize(password);
          setIsLoading(false);
          setIsAuthenticated(true);
        } catch (e) {
          setError((e as Error).message);
          setIsLoading(false);
        }
      }, 1);
  }, [initialize, password, setIsAuthenticated]);

  return (
    <div className={cn('', s.root)}>
      <div className={cn('w-full flex flex-col', s.wrapper)}>
        <div className={cn(s.header)}>
          <NormalSpeakeasy />
        </div>

        <div className={cn('grid grid-cols-12 gap-0', s.content)}>
          <div className='col-span-9 flex flex-col items-start'>
            <span className={cn(s.golden)}>True Freedom</span>
            <span className={cn(s.thick)}>to express yourself,</span>
            <span className={cn(s.golden)}>your thoughts, your beliefs.</span>
            <span className={cn(s.normal)}>
              Speak easily to a group of friends or a global community.{' '}
              <span className={cn(s.highlighted)}>
                Talk about what you want.
              </span>
            </span>
            <span className={cn(s.normal)}>
              Surveillance free. Censorship proof.
              <span className={cn(s.highlighted)}>
                Your speakeasy is yours.
              </span>
            </span>
          </div>
          <div className='col-span-3 pl-3'>
            <h2 className='mb-2'>Login</h2>
            <p
              className='mb-8 text'
              style={{ color: '#5B5D62', lineHeight: '17px' }}
            >
              Use your password to unlock your speakeasy identity
            </p>
            <input
              type='password'
              placeholder='Enter your password'
              value={password}
              onChange={e => {
                setPassword(e.target.value);
              }}
              onKeyDown={e => {
                if (e.keyCode === 13) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />

            <div className='flex flex-col mt-4'>
              <ModalCtaButton
                buttonCopy='Login'
                disabled={isLoading}
                cssClass={s.button}
                onClick={handleSubmit}
              />
            </div>
            {isLoading && (
              <div className={s.loading}>
                <Spinner />
              </div>
            )}

            {error && (
              <div
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
            <span className={cn(s.perkCard__title)}>Open Source</span>
            <span className={cn(s.perkCard__description)}>
              Every line — open source. Forever.
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
              Fundamentally Different
            </span>
            <span className={cn(s.perkCard__description)}>
              Powered by the first decentralized mixnet-blockchain
            </span>
          </a>
          <a
            href='https://www.speakeasy.tech/roadmap/'
            target='_blank'
            rel='noreferrer'
            className={cn('flex flex-col col-span-4', s.perkCard)}
          >
            <RoadMap />
            <span className={cn(s.perkCard__title)}>Roadmap</span>
            <span className={cn(s.perkCard__description)}>
              Building to the future
            </span>
          </a>
        </div>
      </div>
      <div className={cn(s.links)}>
        <a href='https://xx.network/' target='_blank' rel='noreferrer'>
          xx network
        </a>
        <a
          href='https://www.speakeasy.tech/privacy-policy/'
          target='_blank'
          rel='noreferrer'
        >
          Privacy Policy
        </a>

        <a
          href='https://www.speakeasy.tech/terms-of-use/'
          target='_blank'
          rel='noreferrer'
        >
          Terms of Use
        </a>

        <a href='https://xxfoundation.org/' target='_blank' rel='noreferrer'>
          xx foundation
        </a>
        <a href='https://elixxir.io/' target='_blank' rel='noreferrer'>
          xx messenger
        </a>
        <a
          href='https://twitter.com/speakeasy_tech'
          target='_blank'
          rel='noreferrer'
        >
          twitter
        </a>
      </div>
    </div>
  );
};

export default LoginView;
