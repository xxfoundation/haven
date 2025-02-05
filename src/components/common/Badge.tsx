import React, { FC, HTMLAttributes } from 'react';

type Props = HTMLAttributes<HTMLSpanElement> & { color?: 'gold' | 'blue' | 'grey' };

const Badge: FC<Props> = ({ children, color = 'blue', ...props }) => {
  const colorClasses = {
    blue: 'text-blue border-blue',
    gold: 'text-primary border-primary',
    grey: 'text-charcoal-2 border-charcoal-2'
  };

  return (
    <span
      {...props}
      className={`
        text-[0.5rem] font-bold leading-normal tracking-[0.05rem] uppercase
        py-[0.1875rem] px-[0.25rem] pb-[0.125rem]
        rounded border
        ${colorClasses[color]}
        ${props.className || ''}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
