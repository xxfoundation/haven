
import { FC, HTMLAttributes } from 'react';
import cn from 'classnames';

import X from '@components/icons/X';


const CloseButton: FC<HTMLAttributes<HTMLButtonElement>> = (props) => (
  <button {...props} className={cn('text-charcoal-1 cursor-pointer hover:bg-charcoal-3-20 hover:text-primary rounded-full p-1', props.className)}>
    <X className='w-full h-full' />
  </button>
);

export default CloseButton;
