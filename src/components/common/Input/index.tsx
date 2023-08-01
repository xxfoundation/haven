import { FC, InputHTMLAttributes } from 'react';
import cn from 'classnames';

import s from './styles.module.scss';

type Size = 'sm' | 'md' | 'lg';

export type Props = {
  size?: Size
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>

const sizeMap: Record<Size, string> = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-14'
}

const Input: FC<Props> = ({ size = 'md', ...props }) => (
  <input {...props} className={cn(sizeMap[size], s.root, props.className, 'focus:border-primary')} />
);

export default Input;
