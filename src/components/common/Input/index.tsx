import { FC, InputHTMLAttributes } from 'react';
import cn from 'classnames';

import s from './styles.module.scss';

const Input: FC<InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className={cn(s.root, props.className)} />
);

export default Input;
