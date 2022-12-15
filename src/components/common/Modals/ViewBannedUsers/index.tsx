import type { User } from '@contexts/network-client-context';

import { FC, useEffect, useState } from 'react';
import cn from 'classnames';

import { Spinner } from 'src/components/common';
import Modal from '@components/common/Modals';

import { useNetworkClient } from 'src/contexts/network-client-context';
import Identity from 'src/components/common/Identity';

export type MuteUserAction = 'mute' | 'mute+delete';

type Props = {
  onCancel: () => void;
}

const ViewBannedUsersModal: FC<Props> = ({ onCancel }) =>  {
  const { getBannedUsers } = useNetworkClient();
  const [loading, setLoading]  = useState(false);
  const [bannedUsers, setBannedUsers] = useState<User[]>();

  useEffect(() => {
    setLoading(true);
    getBannedUsers()
      .then(setBannedUsers)
      .finally(() => setLoading(false));
  }, [getBannedUsers]);

  return (
    <Modal className='pb-8' onClose={onCancel}>
      <div
        className={cn('w-full flex flex-col justify-center items-center')}
      >
        {loading ? <div className='my-32'><Spinner /></div> : (
          <>
            <h2 className={cn('mt-9 mb-4')}>Warning</h2>
            <p className='mb-4'>
              Unbanning a user will enable them to send messages again.
            </p>
            <div>
              {bannedUsers?.map((user) => (
                <div>
                  <Identity {...user} />
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
