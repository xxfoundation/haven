import { FC } from 'react';
import cn from 'classnames';

const UserWasMuted: FC = () => {
  return (
    <div className={cn('w-full flex flex-col justify-center items-center')}>
      <h2 className='my-10'>
        Error
      </h2>
      <p className='mb-12'>
        You have been muted by an admin and cannot send messages.
      </p>
    </div>
  );
};

export default UserWasMuted;
