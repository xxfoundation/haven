import { FC, useEffect, useState } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import { Button } from 'src/components/common';
import { useNetworkClient } from 'src/contexts/network-client-context';
import useCopyClipboard from 'src/hooks/useCopyToClipboard';
import * as channels from 'src/store/channels';
import { useAppSelector } from 'src/store/hooks';
import ModalTitle from '../ModalTitle';
import Copy from '@components/icons/Copy';
import Checkmark from '@components/icons/Checkmark';

interface Credentials {
  url: string;
  password: string;
}

const CopyButton: FC<{ copied?: boolean, onClick: () => void }> = ({ copied, onClick }) => {
  const Icon = copied ? Checkmark : Copy;
  return (
    <Button
      onClick={onClick}
      variant='unstyled'
      className={cn('p-2 ml-2 hover:bg-charcoal-3-20 rounded-full hover:text-primary duration-100 transition-all', {
        'text-green hover:text-green hover:bg-charcoal-3 bg-charcoal-3': copied,
      })}
    >
      <Icon className='w-6 h-6' />
    </Button>
  );
}

const ShareChannelView: FC = () => {
  const { t } = useTranslation();
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const { getShareURL } = useNetworkClient();
  const [credentials, setCredentials] = useState<Credentials>({
    url: '',
    password: ''
  });
  const [urlCopied, copyUrl] = useCopyClipboard(700);
  const [passwordCopied, copyPassword] = useCopyClipboard(700);
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
    <>
      <ModalTitle className='mb-0'>
        {t('Share Space')}
      </ModalTitle>
      <h3 className='font-semibold'>{currentChannel?.name || ''}</h3>
      {currentChannel?.description && (
        <p className='text-charcoal-1'>{currentChannel?.description || ''}</p>
      )}
      <div className='w-full'>
        <h6 className='uppercase'>
          {t('Space id')}
        </h6>
        <span
          className='text-charcoal-1 py-2 block max-w-[100%] overflow-hidden overflow-x-auto'>
          {currentChannel?.id || ''}
        </span>
      </div>

      {credentials.url.length > 0 && (
        <div className='w-full'>
          <h6 className='uppercase'>
            {t('Invite link')}
          </h6>
          <div className='flex items-center text-charcoal-1'>
            <span
              className={cn('py-2 whitespace-nowrap block max-w-[100%] overflow-hidden overflow-x-auto transition-all duration-100', {
                'text-charcoal-2': urlCopied
              })}>
              {credentials.url}
            </span>
            <CopyButton
              copied={urlCopied}
              onClick={() => {
                copyUrl(credentials.url);
              }} />
          </div>
        </div>
      )}
      {credentials.password.length > 0 && (
        <div className='w-full'>
          <h6 className='uppercase'>
            {t('Password')}
          </h6>
          <div className='flex items-center text-charcoal-1'>
            <span
              className={cn('py-2 whitespace-nowrap block max-w-[100%] overflow-hidden overflow-x-auto transition-all duration-100', {
                'text-charcoal-2': urlCopied
              })}>
              {credentials.password}
            </span>
            <CopyButton
              copied={passwordCopied}
              onClick={() => {
                copyPassword(credentials.password);
              }} />
          </div>
        </div>
      )}

      <p
        className={cn('text-orange text--xs tracking-wide')}
      >
        {t(`Warning: With these credentials anyone can read and send to this
        speakeasy, make sure to keep it safe! Consider only sharing it under
        end-to-end connection.`)}
      </p>
      <Button
        variant='outlined'
        className={cn('w-full flex justify-center transition-all', {
          'border-green text-green': copied
        })}
        onClick={() => {
          copy(
            credentials.password
              ? t('Invite to join {{name}}: \n{{id}} \n{{url}}\nPassword: {{password}}', { ...credentials, ...currentChannel })
              : t('Invite to join {{name}}: \n{{id}} \n{{url}}', { ...credentials, ...currentChannel })
          )
        }}
      >
        {copied ? t('Copied') : t('Copy Complete Invite')}
      </Button>
    </>
  );
};

export default ShareChannelView;
