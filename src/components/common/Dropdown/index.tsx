import { WithChildren } from '@types';
import React, { FC, useCallback, useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import cn from 'classnames';

type Props = WithChildren & {
  isOpen: boolean;
  onChange: (isOpen: boolean) => void;
}

const Dropdown: FC<Props> = ({ children, isOpen, onChange }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => onChange(false), [onChange]);
  useOnClickOutside(dropdownRef, close);

  return (
    <div ref={dropdownRef} className={cn({ hidden: !isOpen }, 'absolute p-2 w-full left-0 mt-6')}>
      {children}
    </div>
  )
};

export default Dropdown;
