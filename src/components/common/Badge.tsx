import React, { FC, HTMLAttributes } from 'react';

type Props = HTMLAttributes<HTMLSpanElement> & { color?: 'gold' | 'blue' | 'grey' };

const Badge: FC<Props> = ({ children, color = 'blue', ...props }) => {
  const colorClasses = {
    blue: 'text-[var(--blue)] border-[var(--blue)]',
    gold: 'text-[var(--primary)] border-[var(--primary)]',
    grey: 'text-[var(--charcoal-2)] border-[var(--charcoal-2)]'
  };

  return (
    <span
      {...props}
      className={`
        text-[0.5rem] font-bold leading-normal tracking-[0.05rem] uppercase
        py-[0.1875rem] px-1 pb-[0.125rem]
        rounded border border-[var(--charcoal-2)]
        ${colorClasses[color]}
        ${props.className || ''}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
