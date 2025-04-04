import { FC, InputHTMLAttributes } from 'react';

type Size = 'sm' | 'md' | 'lg';

export type Props = {
  size?: Size;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

const sizeMap: Record<Size, string> = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-14'
};

const Input: FC<Props> = ({ size = 'md', ...props }) => (
  <input
    {...props}
    className={`
      w-full block
      rounded-[1.5rem]
      px-4
      bg-charcoal-4
      border border-charcoal-1
      focus:outline-none focus:border-primary
      placeholder:text-sm placeholder:text-charcoal-1
      ${sizeMap[size]}
      ${props.className || ''}
    `}
  />
);

export default Input;
