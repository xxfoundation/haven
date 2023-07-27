import { useTranslation } from 'react-i18next';

import { useUI } from '@contexts/ui-context';
import CloseButton from '../CloseButton';
import RightSideTitle from './RightSideTitle';
import Identity from '../Identity';
import { FC, useCallback } from 'react';
import { User, useNetworkClient } from '@contexts/network-client-context';
import useAsync from 'src/hooks/useAsync';
import { Mute } from '@components/icons';
import Spinner from '../Spinner/Spinner';

const MutedUser: FC<User> = (user) => {
  const { muteUser } = useNetworkClient();

  const unmute = useCallback(() => muteUser(user.pubkey, true), [user.pubkey, muteUser])
  const asyncUnmuter = useAsync(unmute);

  return (
    <div className='relative w-[calc(100%_+_3rem)] group -mx-6 py-1.5 pl-6 pr-4 hover:bg-charcoal-3-20 flex items-center justify-between'>
      <Identity clickable className='block text-charcoal-1 truncate' {...user} />
      <button disabled={asyncUnmuter.status === 'pending'} onClick={asyncUnmuter.execute}>
        {asyncUnmuter.status === 'pending'
          ? <Spinner size='xs' />
          : <Mute className='p-1 w-6 h-6 text-charcoal-1 invisible group-hover:visible cursor-pointer hover:bg-charcoal-3-20 hover:text-primary rounded-full' />
        }
        
      </button>
    </div>
  );
}


const MutedUsers = () => {
  const { t } = useTranslation();
  const { setRightSidebarView } = useUI();
  const { mutedUsers } = useNetworkClient();

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <RightSideTitle>
          {t('Muted Users')}
        </RightSideTitle>
        <CloseButton className='w-8 h-8' onClick={() => setRightSidebarView(null) } />
      </div>
      <div className='mt-6'>
        {mutedUsers?.map((u) => (
          <MutedUser key={u.pubkey} {...u} />
        ))}
      </div>
    </div>
  )
}

export default MutedUsers;
