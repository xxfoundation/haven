import type { ChannelJSON } from '@contexts/utils-context';
import { FC, useCallback, useState } from 'react';
import { ModalCtaButton } from 'src/components/common';
import cn from 'classnames';
import { WarningComponent } from 'src/pages/_app';

import s from './JoinChannel.module.scss';

const JoinChannelView: FC<{
  channelInfo: ChannelJSON;
  url: string;
  onConfirm: () => void;
}> = ({ channelInfo, onConfirm, url }) => {
  const [success, setSuccess] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const handleConfirmation = useCallback(() => {
      onConfirm();
      setSuccess(true);
  }, [onConfirm]);

  const handleCancelation = useCallback(() => {
    setCancelled(true);
  }, [])

  if (cancelled) {
    return (
      <WarningComponent>
        You cancelled joining a new Speakeasy. You may close this tab
        and return to your Speakeasy home tab.
      </WarningComponent>
    );
  }

  if (success) {
    return (
      <WarningComponent>
        You have successfully joined!<br />
        Return to your Speakeasy home tab to continue.<br/>
        You may close this tab.'
      </WarningComponent>
    );
  }

  return (
    <div
      className={cn('w-full flex flex-col justify-center items-center', s.root)}
    >
      <h2 className='mt-9 mb-6'>
        Join a Speakeasy
      </h2>
      <div>
        <div className={cn('mb-4')}>
          <h4>{channelInfo?.Name || ''}</h4>
          <p className={cn('mt-2 text text--xs')}>
            {channelInfo?.Description || ''}
          </p>
        </div>
        <div className={cn('text text--sm mb-2')}>
          <span className='font-bold mr-1'>
            Speakeasy id:
          </span>
          <span>{channelInfo?.ReceptionID || ''}</span>
        </div>
        <div className={cn(s.channelCredentials)}>
          <span className='text--sm font-bold'>
            Speakeasy invite link:
          </span>
          {<span className={cn('text text--xs')}>{url}</span>}
        </div>
      </div>
      <div className='flex justify-center'>
        <ModalCtaButton
          buttonCopy='Join'
          cssClass={cn('mb-7 mt-16 mr-4', s.button)}
          onClick={handleConfirmation}
        />
        <ModalCtaButton
          buttonCopy='Cancel'
          cssClass={cn('mb-7 mt-16', s.button)}
          onClick={handleCancelation}
        />
      </div>
    </div>
  );
};

export default JoinChannelView;
