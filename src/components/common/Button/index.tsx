import { FC, ButtonHTMLAttributes } from 'react';
import cn from 'classnames';

import s from './Button.module.scss';

type ButtonProps = {
  component?: React.ElementType;
  width?: string | number;
  size?: 'sm' | 'md' | 'lg',
  variant?: 'primary' | 'secondary' | 'outlined' | 'unstyled',
};

export type Props = ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps;

const Button: FC<Props> = ({
  children,
  component: Component = 'button',
  size = 'md',
  variant = 'primary',
  ...rest
}) => {
  return (
    <Component
      {...rest}
      className={cn(
        s.root,
        'rounded-3xl',
        {
          'bg-primary text-near-black': variant === 'primary',
          'border-primary border text-primary': variant === 'outlined',
          'border-secondary border text-secondary': variant === 'secondary'
        },
        {
          'h-6': size === 'sm',
          'h-10': size === 'md',
          'h-14': size === 'lg'
        },
        rest.className
      )}
    >
      {children}
    </Component>
  );
};

export default Button;
