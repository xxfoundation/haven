import type { FC } from 'react';
import cn from 'classnames';

import s from './LeftSideBar.module.scss';
import { WithChildren } from '@types';

const LeftSideBar: FC<WithChildren & { className?: string }> = ({ children, className }) => {

  return (
    <div data-testid='left-side-bar' className={cn(s.root, className)}>
      {children}
    </div>
  );
};

export default LeftSideBar;
