import { FC } from 'react';
import cn from 'classnames';

const MessageLongView: FC = () => {
  return (
    <div className={cn('w-full flex flex-col justify-center items-center')}>
      <h2 className='my-10'>
        The message is too long, maximum characters allowed 700 characters
      </h2>
    </div>
  );
};

export default MessageLongView;
