import { FC } from 'react';

import cn from 'classnames';

const NetworkNotReadyView: FC = () => {
  return (
    <div className={cn('w-full flex flex-col justify-center items-center')}>
      <h3 className='my-10 text-center'>
        The network is getting ready, please try again shortly.
      </h3>
    </div>
  );
};

export default NetworkNotReadyView;
