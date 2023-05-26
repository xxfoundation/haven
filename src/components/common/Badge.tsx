import React, { FC, HTMLAttributes } from 'react';
import cn from 'classnames';

import s from './Badge.module.scss';

type Props = HTMLAttributes<HTMLSpanElement> & { color?: 'gold' | 'cyan'};

const Badge: FC<Props> = ({ children, color = 'cyan', ...props }) => (
  <span
    {...props}
    className={cn(props.className, s.badge, s[color])}
  >
  {children}
  </span>
);

export default Badge;
