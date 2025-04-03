import React, { FC } from 'react';

import User from './User';
import SidebarControls from './SidebarControls';

type Props = {
  className?: string;
};

const Header: FC<Props> = ({ className }) => {
  return (
    <div
      className={`
      flex w-full justify-between
      bg-[var(--charcoal-4)] 
      px-3 py-4
      border-r border-r-[var(--our-black)]
      rounded-tl-[var(--border-radius)]
      ${className || ''}
    `}
    >
      <User />
      <SidebarControls />
    </div>
  );
};

export default Header;
