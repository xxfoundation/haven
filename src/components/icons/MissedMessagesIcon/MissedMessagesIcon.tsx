import { FC } from 'react';
import s from './MissedMessagesIcon.module.scss';
import cn from 'classnames';

const MissedMessagesIcon: FC<{ muted?: boolean }> = ({ muted }) => {
  return (
    <div className={cn('flex items-center')}>
      <div className={cn(s.bubble, { [s.muted]: muted })}></div>
    </div>
  );
};

export default MissedMessagesIcon;
