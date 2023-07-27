import { FC, ButtonHTMLAttributes } from 'react';
import cn from 'classnames';


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
        {
          'px-6 py-2 min-w-[9.5rem] disabled:hover:cursor-not-allowed font-bold text-md rounded-3xl': variant !== 'unstyled',
          'bg-primary text-near-black': variant === 'primary',
          'border-primary border text-primary': variant === 'outlined',
          'border-secondary border text-secondary': variant === 'secondary'
        },
        variant !== 'unstyled' && {
          'h-7 text-xs py-1 px-0': size === 'sm',
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
