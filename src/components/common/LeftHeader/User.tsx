import React, { FC } from 'react';

import { useAppSelector } from 'src/store/hooks';
import * as identity from 'src/store/identity';
import { Elixxir } from '@components/icons';
import Profile from '@components/icons/Profile';
import { useUI } from '@contexts/ui-context';

const User: FC = () => {
  const { leftSidebarView: sidebarView, setLeftSidebarView: setSidebarView } = useUI();
  const { codename } = useAppSelector(identity.selectors.identity) ?? {};

  return codename ? (
    <button
      className="flex items-center text-blue font-semibold text-xs flex-nowrap overflow-hidden"
      onClick={() => setSidebarView('settings')}
    >
      <Profile
        className={sidebarView === 'settings' ? 'fill-[var(--primary)]' : 'fill-[var(--charcoal-1)]'}
      />
      <span
        className="flex-1 whitespace-nowrap text-[0.8125rem] max-w-[12rem] truncate"
        title={codename}
      >
        <Elixxir className="fill-[var(--blue)] w-[1ch] inline" />
        {codename}
      </span>
    </button>
  ) : null;
};

export default User;
