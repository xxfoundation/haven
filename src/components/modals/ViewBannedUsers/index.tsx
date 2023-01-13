import type { User } from '@contexts/network-client-context';

import { FC, useCallback } from 'react';
import cn from 'classnames';

import { Button, Spinner } from 'src/components/common';
import Modal from 'src/components/modals/Modal';
import { useNetworkClient } from 'src/contexts/network-client-context';
import Identity from 'src/components/common/Identity';
import useAsync from 'src/hooks/useAsync';
import delay from 'delay';

export type MuteUserAction = 'mute' | 'mute+delete';

type Props = {
  onCancel: () => void;
}

const ViewBannedUsersModal: FC<Props> = ({ onCancel }) =>  {
  const { bannedUsers, getBannedUsers, muteUser } = useNetworkClient();
  const getBanned = useAsync(getBannedUsers);
  const muting = useAsync((...args: Parameters<typeof muteUser>) => Promise.all([
    delay(5000),  // delay to let the nodes propagate
    muteUser(...args)
  ]));

  const unbanUser = useCallback((user: User) => async () => {
    await muting.execute(user.pubkey, true);
  }, [muting])

  return (
    <Modal className='pb-8' onClose={onCancel}>
      <div
        className={cn('w-full flex flex-col justify-center items-center')}
      >
        {getBanned.status === 'pending' || muting.status === 'pending' ? <div className='my-32'><Spinner /></div> : (
          <>
            <h2 className={cn('mt-9 mb-4')}>Warning</h2>
            <p className='mb-4'>
              Unbanning a user will enable them to send messages again.
            </p>
            <div className='px-4 mt-4' style={{ maxHeight: '12rem', overflow: 'auto' }}>
              {bannedUsers?.length === 0 && <p style={{ color: 'var(--cyan)'}}>
                [There are currently no banned users in this channel]
              </p>}
              {bannedUsers?.map((user) => (
                <div key={user.pubkey} className='flex items-center justify-between mb-3'>
                  <Identity disableMuteStyles {...user} />
                  <div className='pr-6' />
                  <Button size='sm' onClick={unbanUser(user)}>
                    Unban
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ViewBannedUsersModal;
