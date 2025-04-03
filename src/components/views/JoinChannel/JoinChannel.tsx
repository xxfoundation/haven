import type { ChannelJSON } from 'src/types';
import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'src/components/common';
import WarningComponent from 'src/components/common/WarningComponent';
import CheckboxToggle from 'src/components/common/CheckboxToggle';

type Props = {
  channelInfo: ChannelJSON;
  url: string;
  onConfirm: () => void;
  dmsEnabled: boolean;
  onDmsEnabledChange: (value: boolean) => void;
};

const JoinChannelView: FC<Props> = ({
  channelInfo,
  dmsEnabled,
  onConfirm,
  onDmsEnabledChange,
  url
}) => {
  const { t } = useTranslation();
  const [success, setSuccess] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const handleConfirmation = useCallback(() => {
    onConfirm();
    setSuccess(true);
  }, [onConfirm]);

  const handleCancelation = useCallback(() => {
    setCancelled(true);
  }, []);

  if (cancelled) {
    return (
      <WarningComponent>
        {t(`You cancelled joining a new Chat. You may close this tab
        and return to your home tab.`)}
      </WarningComponent>
    );
  }

  if (success) {
    return (
      <WarningComponent>
        {t('You have successfully joined!')}
        <br />
        {t('Return to your home tab to continue.')}
        <br />
        {t('You may close this tab.')}
      </WarningComponent>
    );
  }

  return (
    <div className='w-full flex flex-col justify-center items-center p-4'>
      <h2 className='mt-9 mb-6'>{t('Join a Chat')}</h2>
      <div className='w-full max-w-[534px]'>
        <div className='mb-4'>
          <h4>{channelInfo?.name || ''}</h4>
          <p className='mt-2 text-xs'>{channelInfo?.description || ''}</p>
        </div>
        <div className='text-sm mb-2'>
          <span className='font-bold mr-1'>{t('Chat id')}:</span>
          <span>{channelInfo?.receptionId || ''}</span>
        </div>
        <div className='w-full max-w-[534px] bg-[var(--dark-5)] mt-4 p-1.5 rounded flex flex-col gap-2 text-[var(--text-secondary)]'>
          <span className='text-sm font-bold'>{t('Chat invite link')}:</span>
          <span className='text-xs break-all'>{url}</span>
        </div>
      </div>
      <div className='flex justify-between mt-8 w-full px-3'>
        <h3 className='headline--sm'>{t('Enable Direct Messages')}</h3>
        <CheckboxToggle checked={dmsEnabled} onChange={() => onDmsEnabledChange(!dmsEnabled)} />
      </div>
      <div className='flex justify-center'>
        <Button
          className='mb-7 mt-16 mr-4 min-w-[120px] text-black disabled:cursor-not-allowed'
          onClick={handleConfirmation}
        >
          {t('Join')}
        </Button>
        <Button
          className='mb-7 mt-16 min-w-[120px] text-black disabled:cursor-not-allowed'
          onClick={handleCancelation}
        >
          {t('Cancel')}
        </Button>
      </div>
    </div>
  );
};

export default JoinChannelView;
