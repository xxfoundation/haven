import CloseButton from '../CloseButton';
import { useUI } from '@contexts/ui-context';
import { useAppSelector } from 'src/store/hooks';
import ChannelBadges from '../ChannelBadges';
import { useTranslation } from 'react-i18next';
import Identity from '../Identity';
import Button from '../Button';
import { fullIdentity } from 'src/store/selectors';
import * as channels from 'src/store/channels';
import { Contributors } from './Contributors';
import CheckboxToggle from '../CheckboxToggle';
import { useNetworkClient } from '@contexts/network-client-context';
import { useCallback } from 'react';
import Spinner from '../Spinner/Spinner';

const SpaceDetails = () => {
  const { t } = useTranslation();
  const { channelManager } = useNetworkClient(); 
  const { openModal, setModalView, setRightSidebarView } = useUI();
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const dmsEnabled = useAppSelector(channels.selectors.dmsEnabled(currentChannel?.id));
  const identity = useAppSelector(fullIdentity);

  const toggleDms = useCallback(() => {
    if (!currentChannel || !channelManager) {
      return;
    }

    const fn = dmsEnabled ? 'DisableDirectMessages' : 'EnableDirectMessages'
    channelManager?.[fn](Buffer.from(currentChannel.id, 'base64'));
  }, [channelManager, currentChannel, dmsEnabled]);

  return (currentChannel && identity) ? (
    <div className='p-6'>
      <div className='flex justify-between items-center'>
        <h2 className='font-medium'>
          {currentChannel.name}
        </h2>
        <CloseButton className='w-8 h-8' onClick={() => setRightSidebarView(null) } />
      </div>
      <p className='space-x-2'>
        <ChannelBadges {...currentChannel} />
      </p>
      <div className='mt-8 space-y-8'>
        {currentChannel.description && (
          <p className='text-charcoal-1 mt-6'>
            {currentChannel.description}
          </p>
        )}
        <div className='space-y-2 text-sm'>
          <h6 className='uppercase'>{t('Space id')}</h6>
          <p className='text-charcoal-1'>{currentChannel.id}</p>
        </div>
        <div className='space-y-2 text-sm'>
          <h6 className='uppercase'>{t('Connected as')}</h6>
          <Identity className='font-semibold block truncate text-charcoal-1' {...identity} />
          <Button onClick={() => {
            setModalView('SET_NICK_NAME');
            openModal();
          }} variant='outlined' size='sm'>
            {t('Set nickname')}
          </Button>
        </div>
        <div className='flex justify-between'>
          <h6 className='uppercase'>{t('Direct Messages')}</h6>
          {dmsEnabled === null ? <Spinner className='m-0 mr-1' /> : (
            <CheckboxToggle checked={dmsEnabled} onChange={toggleDms} />
          )}
        </div>
        <div className='space-y-4 text-sm'>
          <h6 className='uppercase'>{t('Recent contributors')}</h6>
          <div>
            <Contributors />
          </div>
        </div>
      </div>
    </div>
  ) : null;
}
export default SpaceDetails;
