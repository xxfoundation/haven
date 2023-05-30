import { FC, useEffect, useState } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import { PrimaryButton } from 'src/components/common';
import { useNetworkClient } from 'src/contexts/network-client-context';
import useCopyClipboard from 'src/hooks/useCopyToClipboard';
import * as channels from 'src/store/channels';
import { useAppSelector } from 'src/store/hooks';
import s from './ShareChannelView.module.scss';

interface Credentials {
  url: string;
  password: string;
}

const ShareChannelView: FC = () => {
  const { t } = useTranslation();
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const { getShareURL } = useNetworkClient();
  const [credentials, setCredentials] = useState<Credentials>({
    url: '',
    password: ''
  });
  const [copied, copy] = useCopyClipboard(700);

  useEffect(() => {
    if (currentChannel) {
      const resultCredential = getShareURL(currentChannel?.id);
    
      if (resultCredential) {
        setCredentials({
          url: resultCredential?.url || '',
          password: resultCredential?.password || ''
        });
      }
    }
  }, [currentChannel, getShareURL]);

  return (
    <div
      className={cn('w-full flex flex-col justify-center items-center', s.root)}
    >
      <h2 className='mt-9 mb-6'>
        {t('Share Speakeasy')}
      </h2>
      <div>
        <div className={cn('mb-4')}>
          <h4>{currentChannel?.name || ''}</h4>
          <p className={cn('mt-2 text text--xs')}>
            {currentChannel?.description || ''}
          </p>
        </div>
        <div className={cn('text text--sm mb-2')}>
          <span className='font-bold mr-1'>
            {t('Speakeasy id')}:</span>
          <span>{currentChannel?.id || ''}</span>
        </div>
        <div className={cn(s.channelCredentials)}>
          <span className='text--sm font-bold'>
            {t('Speakeasy invite link')}:
          </span>
          {credentials.url.length > 0 && (
            <span className={cn('text text--xs')}>
              {credentials.url}
            </span>
          )}
          {credentials.password.length > 0 && (
            <>
              <span className='text--sm font-bold mt-1'>
                {t('Speakeasy passphrase')}:
              </span>
              <span  className={cn('text text--xs')}>
                {credentials.password}
              </span>
            </>
          )}
        </div>
      </div>
      <div className='mb-7 mt-8' style={{ textAlign: 'center'}}>
        <div className='mb-5' style={{ color: 'var(--green)', opacity: copied ? 1 : 0, transition: 'all 0.2s ease-out' }}>
          {t('Copied!')}
        </div>
        <PrimaryButton
          buttonCopy={t('Copy')}
          cssClass={cn(s.button)}
          onClick={() => {
            copy(credentials.password
                ? `${credentials.url} Passphrase: ${credentials.password}`
                : credentials.url);
          }}
        />
      </div>
      <p
        className={cn('mb-8 text text--xs', s.warn)}
        style={{ color: 'var(--cyan)', lineHeight: '13px' }}
      >
        {t(`Warning: With these credentials anyone can read and send to this
        speakeasy, make sure to keep it safe! Consider only sharing it under
        end-to-end connection.`)}
      </p>
    </div>
  );
};

export default ShareChannelView;
