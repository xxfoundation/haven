import { FC, ButtonHTMLAttributes } from 'react';
import cn from 'classnames';

import s from './Button.module.scss';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  component?: React.ElementType;
  width?: string | number;
  cssClasses?: string;
  size?: 'sm' | 'md',
}

const Button: FC<ButtonProps> = ({
  children,
  component: Component = 'button',
  cssClasses,
  size = 'md',
  style,
  width,
  ...rest
}) => {
  return (
    <Component
      className={cn(s.root, cssClasses, rest.className)}
      style={{
        width,
        ...style,
        ...(size === 'sm' && {
          borderRadius: '0.25rem',
          border: '1px solid var(--cyan)',
          borderStyle: 'solid',
          padding: '0.1rem 0.75rem',
          minWidth:'unset'
        })
      }}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default Button;
