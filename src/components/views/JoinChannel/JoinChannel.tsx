import type { ChannelJSON } from '@contexts/utils-context';
import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';

import { ModalCtaButton } from 'src/components/common';
import { WarningComponent } from 'src/pages/_app';

import s from './JoinChannel.module.scss';

type Props = {
  channelInfo: ChannelJSON;
  url: string;
  onConfirm: () => void;
}

const JoinChannelView: FC<Props> = ({ channelInfo, onConfirm, url }) => {
  const { t } = useTranslation();
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
        {t(`You cancelled joining a new Speakeasy. You may close this tab
        and return to your Speakeasy home tab.`)}
      </WarningComponent>
    );
  }

  if (success) {
    return (
      <WarningComponent>
        {t('You have successfully joined!')}<br />
        {t('Return to your Speakeasy home tab to continue.')}<br/>
        {t('You may close this tab.')}
      </WarningComponent>
    );
  }

  return (
    <div
      className={cn('w-full flex flex-col justify-center items-center', s.root)}
    >
      <h2 className='mt-9 mb-6'>
        {t('Join a Speakeasy')}
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
            {t('Speakeasy id')}:
          </span>
          <span>{channelInfo?.ReceptionID || ''}</span>
        </div>
        <div className={cn(s.channelCredentials)}>
          <span className='text--sm font-bold'>
            {t('Speakeasy invite link')}:
          </span>
          {<span className={cn('text text--xs')}>{url}</span>}
        </div>
      </div>
      <div className='flex justify-center'>
        <ModalCtaButton
          buttonCopy={t('Join')}
          cssClass={cn('mb-7 mt-16 mr-4', s.button)}
          onClick={handleConfirmation}
        />
        <ModalCtaButton
          buttonCopy={t('Cancel')}
          cssClass={cn('mb-7 mt-16', s.button)}
          onClick={handleCancelation}
        />
      </div>
    </div>
  );
};

export default JoinChannelView;
