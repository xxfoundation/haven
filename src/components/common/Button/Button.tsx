import { FC, ButtonHTMLAttributes } from 'react';
import cn from 'classnames';

import s from './Button.module.scss';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  component?: React.ElementType;
  width?: string | number;
  cssClasses?: string;
}

const Button: FC<ButtonProps> = ({
  children,
  component: Component = 'button',
  cssClasses,
  style,
  width,
  ...rest
}) => {
  return (
    <Component
      className={cn(s.root, cssClasses)}
      style={{
        width,
        ...style
      }}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default Button;
