import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';

import { useNetworkClient, User } from '@contexts/network-client-context';
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
  const isMuted = useAppSelector(channels.selectors.mutedUsers)[currentChannel?.id ?? '']?.includes(
    contributor.pubkey
  );

  const onClick = useCallback(() => {
    if (typeof contributor.dmToken !== 'number') {
      throw new Error('Token required for dm');
    }
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
        {muteToggleAsync.status === 'pending' ? (
          <Spinner size='xs' />
        ) : (
          <Ellipsis className='p-1 w-6 h-6 text-charcoal-1 invisible group-hover:visible cursor-pointer hover:bg-charcoal-3-20 hover:text-primary rounded-full' />
        )}
      </button>
      <Dropdown className='mr-3' isOpen={isOpen} onChange={setIsOpen}>
        {contributor.dmToken !== undefined && (
          <DropdownItem onClick={onClick} className='text-sm' icon={Envelope}>
            {t('Direct Message')}
          </DropdownItem>
        )}
        <DropdownItem
          onClick={muteToggleAsync.execute}
          className={cn('text-sm', { 'text-primary': isMuted })}
          icon={Mute}
        >
          {isMuted ? t('Local Unmute') : t('Local Mute')}
        </DropdownItem>
      </Dropdown>
    </div>
  );
};

export const Contributors = () => {
  const recentContributors = useAppSelector(messages.selectors.currentChannelContributors);

  return (
    <>
      {recentContributors.map((contributor) => (
        <ContributorComponent key={contributor.pubkey} {...contributor} />
      ))}
    </>
  );
};

const MutedUserComponent: FC<User & { isAdmin: boolean }> = ({ isAdmin, ...user }) => {
  const { t } = useTranslation();
  const { muteUser } = useNetworkClient();

  const handleUnmute = useCallback(async () => {
    await muteUser(user.pubkey, true); // true means unmute
  }, [user.pubkey, muteUser]);

  const unmuteAsync = useAsync(handleUnmute);

  return (
    <div className='relative w-[calc(100%_+_3rem)] group -mx-6 py-1.5 pl-6 pr-4 hover:bg-charcoal-3-20 flex items-center justify-between'>
      <Identity clickable className='block text-muted truncate' {...user} />
      {isAdmin && (
        <button
          onClick={unmuteAsync.execute}
          disabled={unmuteAsync.status === 'pending'}
          className='px-3 py-1 text-xs text-primary hover:bg-charcoal-3-20 rounded invisible group-hover:visible'
        >
          {unmuteAsync.status === 'pending' ? <Spinner size='xs' /> : t('Unmute')}
        </button>
      )}
    </div>
  );
};

const ContributorsView = () => {
  const { t } = useTranslation();
  const { setRightSidebarView } = useUI();
  const { mutedUsers } = useNetworkClient();
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const recentContributors = useAppSelector(messages.selectors.currentChannelContributors);
  
  const [showAllContributors, setShowAllContributors] = useState(false);
  const [showAllMuted, setShowAllMuted] = useState(false);

  const CONTRIBUTOR_LIMIT = 5;
  const MUTED_LIMIT = 3;

  // Get list of muted user pubkeys for the current channel
  const mutedUserPubkeys = useAppSelector(channels.selectors.mutedUsers)[currentChannel?.id ?? ''] || [];
  
  // Filter out muted users from recent contributors
  const unmutedContributors = recentContributors.filter(
    (contributor) => !mutedUserPubkeys.includes(contributor.pubkey)
  );

  const displayedContributors = showAllContributors
    ? unmutedContributors
    : unmutedContributors.slice(0, CONTRIBUTOR_LIMIT);

  const displayedMuted = showAllMuted
    ? mutedUsers
    : mutedUsers?.slice(0, MUTED_LIMIT);

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <RightSideTitle>{t('Contributors & Muted Users')}</RightSideTitle>
        <CloseButton className='w-8 h-8' onClick={() => setRightSidebarView(null)} />
      </div>

      {/* Contributors Section */}
      <div className='mt-6'>
        <h3 className='text-sm font-semibold mb-2 text-charcoal-1'>
          {t('Recent Contributors')} ({unmutedContributors.length})
        </h3>
        {displayedContributors.map((contributor) => (
          <ContributorComponent key={contributor.pubkey} {...contributor} />
        ))}
        {unmutedContributors.length > CONTRIBUTOR_LIMIT && (
          <button
            onClick={() => setShowAllContributors(!showAllContributors)}
            className='text-primary text-sm mt-2 hover:underline'
          >
            {showAllContributors
              ? `${t('Show Less')} ▲`
              : `${t('Show All')} ${unmutedContributors.length} ▼`}
          </button>
        )}
      </div>

      {/* Divider */}
      {mutedUsers && mutedUsers.length > 0 && (
        <hr className='my-6 border-charcoal-3' />
      )}

      {/* Muted Users Section */}
      {mutedUsers && mutedUsers.length > 0 && (
        <div>
          <h3 className='text-sm font-semibold mb-2 text-charcoal-2'>
            {t('Muted Users')} ({mutedUsers.length})
          </h3>
          {displayedMuted?.map((user) => (
            <MutedUserComponent key={user.pubkey} {...user} isAdmin={currentChannel?.isAdmin ?? false} />
          ))}
          {mutedUsers.length > MUTED_LIMIT && (
            <button
              onClick={() => setShowAllMuted(!showAllMuted)}
              className='text-primary text-sm mt-2 hover:underline'
            >
              {showAllMuted
                ? `${t('Show Less')} ▲`
                : `${t('Show All')} ${mutedUsers.length} ▼`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ContributorsView;
