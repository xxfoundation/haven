import type { FC } from 'react';
import cn from 'classnames';

import { WithChildren } from '@types';

const LeftSideBar: FC<WithChildren & { className?: string }> = ({ children, className }) => {

  return (
    <div data-testid='left-side-bar' className={cn(className, 'bg-our-black')}>
      {children}
    </div>
  );
};

export default LeftSideBar;
