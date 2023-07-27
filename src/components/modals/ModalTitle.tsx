import { FC, HTMLAttributes } from 'react';
import cn from 'classnames';

const ModalTitle: FC<HTMLAttributes<HTMLDivElement>> = (props) => (
  <h2 className={cn(props.className, 'text-3xl mb-2')}>
    {props.children}
  </h2>
);

export default ModalTitle;
