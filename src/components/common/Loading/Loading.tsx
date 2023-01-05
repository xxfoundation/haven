import type { WithChildren } from '@types';
import type { FC } from 'react';
import cn from 'classnames';
import s from './Loading.module.scss';
import { Spinner } from 'src/components/common';

type Props = WithChildren;

const Loading: FC<Props> = ({ children }) => {
  return (
    <div className={cn(s.root)}>
      <div>
        {children ? children : <Spinner size='lg' />}
        <div className='mt-2'>Loading...</div>
      </div>
    </div>
  );
};

export default Loading;
