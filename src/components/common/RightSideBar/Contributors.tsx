import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import assert from 'assert';

import { useNetworkClient } from '@contexts/network-client-context';
import useDmClient from 'src/hooks/useDmClient';
import { useAppSelector } from 'src/store/hooks';
import { Contributor } from 'src/types';
import * as channels from 'src/store/channels';
import * as messages from 'src/store/messages';
import useAsync from 'src/hooks/useAsync';
import Identity from '../Identity';
import Ellipsis from '@components/icons/Ellipsis';
import Spinner from '../Spinner/Spinner';
import Dropdown, { DropdownItem } from '../Dropdown';
import { Mute } from '@components/icons';
import Envelope from 'src/components/icons/Envelope';
import RightSideTitle from './RightSideTitle';
import CloseButton from '../CloseButton';
import { useUI } from '@contexts/ui-context';


const ContributorComponent: FC<Contributor> = (contributor) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { createConversation } = useDmClient();
  const { muteUser } = useNetworkClient();
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const isMuted = useAppSelector(channels.selectors.mutedUsers)
    [currentChannel?.id ?? '']?.includes(contributor.pubkey)

  const onClick = useCallback(() => {
    assert(typeof contributor.dmToken === 'number', 'Token required for dm');
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

  const muteToggleAsync = useAsync(toggleMute);

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

export const Contributors = () => {
  const recentContributors = useAppSelector(messages.selectors.currentChannelContributors);
  
  return (
    <>
      {recentContributors.map((contributor) => (
        <ContributorComponent key={contributor.pubkey} {...contributor} />
      ))}
    </>
  )
}

const ContributorsView = () => {
  const { t } = useTranslation();
  const { setRightSidebarView } = useUI();

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <RightSideTitle>
          {t('Recent Contributors')}
        </RightSideTitle>
        <CloseButton className='w-8 h-8' onClick={() => setRightSidebarView(null) } />
      </div>
      <div className='mt-6'>
        <Contributors />
      </div>
    </div>
  )
}

export default ContributorsView;