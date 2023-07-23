import type { FC } from 'react';
import cn from 'classnames';

import { WithChildren } from '@types';
import { LeftSidebarView } from 'src/types/ui';
import DMs from '../DMs';
import Spaces from '../Spaces';
import SettingsMenu from '../SettingsMenu';
import { useUI } from '@contexts/ui-context';

const views: Record<LeftSidebarView, FC> = {
  'dms': DMs,
  'spaces': Spaces,
  'settings': SettingsMenu,
}

const LeftSideBar: FC<WithChildren & { className?: string }> = ({ className }) => {
  const { leftSidebarView } = useUI();

  const View = views[leftSidebarView] ?? (() => null);
  return (
    <div data-testid='left-side-bar' className={cn(className, 'bg-our-black overflow-y-auto')}>
      <View />
    </div>
  );
};

export default LeftSideBar;
