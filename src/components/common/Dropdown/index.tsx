import { WithChildren } from '@types';
import React, { FC, HTMLAttributes, SVGProps, useCallback, useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import cn from 'classnames';

import s from './Dropdown.module.scss';


type DropdownItemProps = WithChildren
  & HTMLAttributes<HTMLDivElement>
  & { icon?: FC<SVGProps<SVGSVGElement>> };

export const DropdownItem: FC<DropdownItemProps> = ({ children, icon: Icon, ...props }) => (
  <div className={cn(props.className, s.item, 'group space-x-2 hover:text-primary text-white')} {...props}>
    {Icon && <Icon className='w-9 h-9 text-charcoal-1 group-hover:text-primary' />}
    <span className=''>{children}</span>
  </div>
)

type Props = WithChildren & {
  isOpen: boolean;
  onChange: (isOpen: boolean) => void;
  className?: string;
}

const Dropdown: FC<Props> = ({ children, className, isOpen, onChange }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => onChange(false), [onChange]);
  useOnClickOutside(dropdownRef, close);

  return (
    <div ref={dropdownRef} className={cn(className, 'min-w-[16rem]', s.root, { hidden: !isOpen })}>
      {children}
    </div>
  )
};

export default Dropdown;
