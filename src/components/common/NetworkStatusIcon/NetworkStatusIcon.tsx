import { FC } from 'react';

import s from './NetworkStatusIcon.module.scss';
import cn from 'classnames';
import { useNetworkClient } from 'src/contexts/network-client-context';

const NetworkStatusIcon: FC = () => {
  const { isNetworkHealthy } = useNetworkClient();

  if (typeof isNetworkHealthy === 'undefined') {
    return null;
  } else {
    return (
      <div className={cn('flex items-center mt-4')}>
        <div
          className={cn(
            s.bubble,
            { [s.bubble__connected]: isNetworkHealthy },
            { [s.bubble__failed]: !isNetworkHealthy }
          )}
        ></div>
      </div>
    );
  }
};

export default NetworkStatusIcon;
