import type { SidebarView } from 'src/types/ui';

import React, { FC } from 'react';
import cn from 'classnames';

import s from './LeftHeader.module.scss';
import User from './User';
import SidebarControls from './SidebarControls';

type Props = {
  className?: string;
  view: SidebarView;
  onViewChange: (view: SidebarView) => void;
}

const Header: FC<Props> = ({ className, ...props }) => {
  return (
    <div className={cn(className, s.root)}>
      <User {...props} />
      <SidebarControls {...props} />
    </div>
  )
}

export default Header;
