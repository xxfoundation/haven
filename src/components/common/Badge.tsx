import React, { FC, HTMLAttributes } from 'react';
import cn from 'classnames';

import s from './Badge.module.scss';

type Props = HTMLAttributes<HTMLSpanElement> & { color?: 'gold' | 'blue' | 'grey'};

const Badge: FC<Props> = ({ children, color = 'blue', ...props }) => (
  <span
    {...props}
    className={cn(s.badge, s[color], props.className)}
  >
  {children}
  </span>
);

export default Badge;
