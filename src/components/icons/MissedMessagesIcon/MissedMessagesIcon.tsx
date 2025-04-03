import { FC } from 'react';
import cn from 'classnames';

const MissedMessagesIcon: FC<{ muted?: boolean }> = ({ muted }) => {
  return (
    <div className='flex items-center'>
      <div
        className={cn(
          'block cursor-pointer after:block after:w-2 after:h-2 after:rounded-full',
          'after:bg-[var(--cyan)] hover:after:bg-[var(--cyan)]',
          {
            'after:bg-[var(--text-muted)]': muted
          }
        )}
      ></div>
    </div>
  );
};

export default MissedMessagesIcon;
