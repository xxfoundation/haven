import { FC, ButtonHTMLAttributes } from 'react';
import cn from 'classnames';

import s from './Button.module.scss';

export type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  component?: React.ElementType;
  width?: string | number;
  size?: 'sm' | 'md',
}

const Button: FC<Props> = ({
  children,
  component: Component = 'button',
  size = 'md',
  style,
  width,
  ...rest
}) => {
  return (
    <Component
      {...rest}
      className={cn(rest.className, s.root)}
      style={{
        width,
        ...(size === 'sm' && {
          borderRadius: '0.25rem',
          border: '1px solid',
          borderStyle: 'solid',
          padding: '0.1rem 0.75rem',
          minWidth:'unset'
        }),
        ...style,
      }}
    >
      {children}
    </Component>
  );
};

export default Button;
