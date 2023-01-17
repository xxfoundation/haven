import React, { InputHTMLAttributes, FC } from 'react';

import cn from 'classnames';

type Props = InputHTMLAttributes<HTMLInputElement>;

const CheckboxToggle: FC<Props> = (props) => (
  <label className='relative inline-flex items-center cursor-pointer'>
    <input
      type='checkbox'
      checked
      {...props}
      className={cn(props.className, 'sr-only peer')}
    />
    <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:peer-focus:ring-orange-400 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-400"></div>
  </label>
);

export default CheckboxToggle;
