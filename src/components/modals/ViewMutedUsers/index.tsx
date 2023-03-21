import type { User } from '@contexts/network-client-context';

import { FC, useCallback } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import { Button } from 'src/components/common';
import { useNetworkClient } from 'src/contexts/network-client-context';
import Identity from 'src/components/common/Identity';
import useAsync from 'src/hooks/useAsync';
import * as channels from 'src/store/channels';
import { useAppSelector } from 'src/store/hooks';
import { awaitEvent, Event } from 'src/events';
import Loading from '../LoadingView';

export type MuteUserAction = 'mute' | 'mute+delete';

const ViewMutedUsers: FC = () =>  {
  const { t } = useTranslation();
  const { getMutedUsers, muteUser, mutedUsers } = useNetworkClient();
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const getMuted = useAsync(getMutedUsers);
  const muting = useAsync((...args: Parameters<typeof muteUser>) => Promise.all([
    awaitEvent(Event.USER_MUTED),  // delay to let the nodes propagate
    muteUser(...args)
  ]));

  const unMuteUser = useCallback((user: User) => async () => {
    await muting.execute(user.pubkey, true);
  }, [muting])

  const isLoading = getMuted.status === 'pending' || muting.status === 'pending';

  return (
    <div
      className={cn('w-full flex flex-col justify-center items-center pb-8')}
    >
      {isLoading ? <Loading /> : (
        <>
          <h2 className={cn('mt-9 mb-4')}>
            {t('Muted Users')}
          </h2>
          {currentChannel?.isAdmin && (
            <p className='mb-4 text-center'>
              {t('Warning: Unmuting a user will enable them to send messages again.')}
            </p>
          )}
          <div className='px-4 mt-4' style={{ maxHeight: '12rem', overflow: 'auto' }}>
            {mutedUsers?.length === 0 && <p style={{ color: 'var(--cyan)'}}>
              [{t('There are currently no muted users in this channel')}]
            </p>}
            {mutedUsers?.map((user) => (
              <div key={user.pubkey} className='flex items-center justify-between mb-3'>
                <Identity disableMuteStyles {...user} />
                <div className='pr-6' />
                {currentChannel?.isAdmin && (
                  <Button size='sm' onClick={unMuteUser(user)}>
                    {t('Unmute')}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ViewMutedUsers;
