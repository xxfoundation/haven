import React, { FC } from 'react';
import cn from 'classnames';

import s from './LeftHeader.module.scss';
import User from './User';
import SidebarControls from './SidebarControls';

type Props = {
  className?: string;
}

const Header: FC<Props> = ({ className }) => {
  return (
    <div className={cn(className, s.root)}>
      <User />
      <SidebarControls />
    </div>
  )
}

export default Header;
