import React, { InputHTMLAttributes, FC } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement>;

const CheckboxToggle: FC<Props> = (props) => (
  <label className='relative inline-flex items-center cursor-pointer'>
    <input
      data-testid='channel-dm-toggle'
      type='checkbox'
      checked
      {...props}
      className={`sr-only peer ${props.className || ''}`}
    />
    <div
      className={`
      w-11 h-6 rounded-full 
      border border-charcoal-1 bg-near-black
      transition-all
      peer-checked:bg-primary
      after:content-[''] 
      after:absolute 
      after:top-0.5 
      after:left-[2px]
      after:bg-primary
      after:border-charcoal-1 
      after:rounded-full 
      after:h-5 
      after:w-5 
      after:transition-all
      peer-checked:after:translate-x-full
      peer-checked:after:bg-near-black
      peer-checked:after:border-white
    `}
    />
  </label>
);

export default CheckboxToggle;
