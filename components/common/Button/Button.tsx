import { FC, ButtonHTMLAttributes, JSXElementConstructor } from "react";
import s from "./Button.module.scss";
import cn from "classnames";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  Component?: string | JSXElementConstructor<any>;
  width?: string | number;
  cssClasses?: string;
}

const Button: FC<ButtonProps> = ({
  Component = "button",
  width,
  cssClasses,
  children,
  style,
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
