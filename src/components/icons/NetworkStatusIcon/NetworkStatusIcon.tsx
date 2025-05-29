import { FC } from 'react';
import cn from 'classnames';
import { useNetworkClient } from 'src/contexts/network-client-context';

const NetworkStatusIcon: FC = () => {
  const { isNetworkHealthy } = useNetworkClient();

  if (typeof isNetworkHealthy === 'undefined') {
    return null;
  } else {
    return (
      <div className='flex items-center mt-4'>
        <div
          className={cn('block cursor-pointer after:block after:w-2 after:h-2 after:rounded-full', {
            'after:bg-[greenyellow] hover:after:bg-[greenyellow]': isNetworkHealthy,
            'after:bg-[var(--red)] hover:after:bg-[var(--red)]': !isNetworkHealthy
          })}
        ></div>
      </div>
    );
  }
};

export default NetworkStatusIcon;
