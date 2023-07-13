import React, { FC } from 'react';

import { useAppSelector } from 'src/store/hooks';
import * as identity from 'src/store/identity';
import { Elixxir } from '@components/icons';
import Profile from '@components/icons/Profile';
import { useUI } from '@contexts/ui-context';

const User: FC= () => {
  const { setSidebarView, sidebarView } = useUI();
  const { codename } = useAppSelector(identity.selectors.identity) ?? {};

  return codename ? (
    <button className='flex items-center text-blue font-semibold text-xs flex-nowrap' onClick={() => setSidebarView('settings')}>
        <Profile 
          style={{
            fill: sidebarView === 'settings'
              ? 'var(--primary)'
              : 'var(--charcoal-1)'
          }}
        />
        <span
        title={codename}
        style={{
          flexGrow: 1,
          whiteSpace: 'nowrap',
          width: '12rem',
          textOverflow: 'ellipsis',
          overflow: 'hidden'
        }}>
        <Elixxir
          style={{ fill: 'var(--blue)', width: '1ch', display: 'inline' }}
        />
        {codename}
      </span>
    </button>
  ) : null;
}

export default User;
