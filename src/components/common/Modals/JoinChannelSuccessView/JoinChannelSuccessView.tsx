import { FC } from 'react';
import s from './JoinChannelSuccessView.module.scss';
import cn from 'classnames';

const JoinChannelSuccessView: FC = () => {
  return (
    <div
      className={cn('w-full flex flex-col justify-center items-center', s.root)}
    >
      <span className='text font-bold mt-9 mb-4'>
        Awesome! You joined a new speakeasy successfully.
      </span>
    </div>
  );
};

export default JoinChannelSuccessView;
