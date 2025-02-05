import type { WithChildren } from 'src/types';
import type { FC } from 'react';

const RightSideTitle: FC<WithChildren> = ({ children }) => (
  <h2 className='font-medium text-xl leading-normal'>{children}</h2>
);

export default RightSideTitle;
