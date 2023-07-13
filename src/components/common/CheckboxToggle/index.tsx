import React, { InputHTMLAttributes, FC } from 'react';

import cn from 'classnames';

type Props = InputHTMLAttributes<HTMLInputElement>;

const CheckboxToggle: FC<Props> = (props) => (
  <label className='relative inline-flex items-center cursor-pointer'>
    <input
      data-testid='channel-dm-toggle'
      type='checkbox'
      checked
      {...props}
      className={cn(props.className, 'sr-only peer')}
    />
    <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full border border-charcoal-1 bg-near-black peer-checked:bg-primary peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-near-black after:border-charcoal-1 after:rounded-full after:bg-primary peer-checked:after:bg-near-black after:h-5 after:w-5 after:transition-all transition-all"></div>
  </label>
);

export default CheckboxToggle;
