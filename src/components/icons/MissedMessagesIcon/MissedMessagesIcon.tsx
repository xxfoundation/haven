import { FC } from 'react';
import s from './MissedMessagesIcon.module.scss';
import cn from 'classnames';

const MissedMessagesIcon: FC = ({}) => {
  return (
    <div className={cn('flex items-center')}>
      <div className={cn(s.bubble)}></div>
    </div>
  );
};

export default MissedMessagesIcon;
