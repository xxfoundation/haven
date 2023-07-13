import { WithChildren } from '@types';
import React, { FC, HTMLAttributes, useCallback, useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import cn from 'classnames';

import s from './Dropdown.module.scss';

type Props = WithChildren & {
  isOpen: boolean;
  onChange: (isOpen: boolean) => void;
}

export const DropdownItem: FC<WithChildren & HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div className={cn(props.className, s.item, 'space-x-2')} {...props}>
    {children}
  </div>
)

const Dropdown: FC<Props> = ({ children, isOpen, onChange }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => onChange(false), [onChange]);
  useOnClickOutside(dropdownRef, close);

  return (
    <div ref={dropdownRef} className={cn(s.root, { hidden: !isOpen })}>
      {children}
    </div>
  )
};

export default Dropdown;
