import { FC, useCallback, useState } from 'react';
import assert from 'assert';
import cn from 'classnames';

import CloseButton from '../CloseButton';
import { useUI } from '@contexts/ui-context';
import { useAppSelector } from 'src/store/hooks';
import ChannelBadges from '../ChannelBadges';
import { useTranslation } from 'react-i18next';
import Identity from '../Identity';
import Button from '../Button';
import { fullIdentity } from 'src/store/selectors';
import * as channels from 'src/store/channels';
import * as messages from 'src/store/messages';
import { Contributor } from '@types';
import Ellipsis from '@components/icons/Ellipsis';
import Envelope from 'src/components/icons/Envelope';
import Dropdown, { DropdownItem } from '../Dropdown';
import useDmClient from 'src/hooks/useDmClient';
import { useNetworkClient } from '@contexts/network-client-context';
import { Mute } from '@components/icons';
import useAsync from 'src/hooks/useAsync';
import Spinner from '../Spinner/Spinner';
import { ChannelEvents, awaitChannelEvent } from 'src/events';

const ContributorComponent: FC<Contributor> = (contributor) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { createConversation } = useDmClient();
  const { muteUser } = useNetworkClient();
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const isMuted = useAppSelector(channels.selectors.mutedUsers)
    [currentChannel?.id ?? '']?.includes(contributor.pubkey)

  const onClick = useCallback(() => {
    assert(contributor.dmToken, 'Token required for dm');
    createConversation({
      ...contributor,
      color: contributor.color ?? 'var(--text-charcoal-1)',
      token: contributor.dmToken
    }); 
  }, [contributor, createConversation]);

  const toggleMute = useCallback(
    () => muteUser(contributor.pubkey, isMuted),
    [contributor.pubkey, isMuted, muteUser]
  );

  const muteToggleAsync = useAsync(async () => {
    await toggleMute();
    await awaitChannelEvent(ChannelEvents.USER_MUTED, (e) => e.pubkey === contributor.pubkey);
  });

  return (
    <div className='relative w-[calc(100%_+_3rem)] group -mx-6 py-1.5 pl-6 pr-4 hover:bg-charcoal-3-20 flex items-center justify-between'>
      <Identity clickable className='block text-charcoal-1 truncate' {...contributor} />
      <button disabled={muteToggleAsync.status === 'pending'} onClick={() => setIsOpen(true)}>
        {muteToggleAsync.status === 'pending'
          ? <Spinner size='xs' />
          : <Ellipsis className='p-1 w-6 h-6 text-charcoal-1 invisible group-hover:visible cursor-pointer hover:bg-charcoal-3-20 hover:text-primary rounded-full' />
        }
        
      </button>
      <Dropdown className='mr-3' isOpen={isOpen} onChange={setIsOpen}>
        {contributor.dmToken !== undefined && (
          <DropdownItem onClick={onClick}  className='text-sm' icon={Envelope}>
            {t('Direct Message')}
          </DropdownItem>
        )}
        <DropdownItem
          onClick={muteToggleAsync.execute}
          className={cn('text-sm', { 'text-primary': isMuted })}
          icon={Mute}>
          {isMuted ? t('Local Unmute') : t('Local Mute')}
        </DropdownItem>
      </Dropdown>
    </div>
  );
}

const SpaceDetails = () => {
  const { t } = useTranslation();
  const { openModal, setModalView, setRightSidebarView } = useUI();
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const recentContributors = useAppSelector(messages.selectors.currentChannelContributors);
  const identity = useAppSelector(fullIdentity);

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
        <div className='space-y-4 text-sm'>
          <h6 className='uppercase'>{t('Recent contributors')}</h6>
          <div>
            {recentContributors.map((contributor) => (
              <ContributorComponent key={contributor.pubkey} {...contributor} />
            ))}
          </div>
        </div>
      </div>
    </div>
  ) : null;
}
export default SpaceDetails;
