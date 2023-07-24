import { WithChildren } from '@types';
import React, { FC, HTMLAttributes, MouseEventHandler, SVGProps, createContext, useCallback, useContext, useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import cn from 'classnames';

import s from './Dropdown.module.scss';


type CTX = { isOpen: boolean, close: () => void };
const DropdownContext = createContext<CTX>({} as CTX);

type DropdownItemProps = WithChildren
  & HTMLAttributes<HTMLButtonElement>
  & { icon?: FC<SVGProps<SVGSVGElement>> };

export const DropdownItem: FC<DropdownItemProps> = ({ children, icon: Icon, onClick: _onClick, ...props }) => {
  const { close } = useContext(DropdownContext);
  const onClick = useCallback<MouseEventHandler<HTMLButtonElement>>((evt) => {
    if (_onClick) {
      _onClick(evt);
      close();
    }
  }, [close, _onClick]);

  return (
    <button
      {...props}
      className={cn(props.className, s.item, 'group w-full space-x-2 hover:text-primary text-white')}
      onClick={onClick}>
      {Icon && <Icon className='w-9 h-9 text-charcoal-1 group-hover:text-primary' />}
      <span className=''>{children}</span>
    </button>
  )
}

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
    <DropdownContext.Provider value={{ isOpen, close }}>
      <div ref={dropdownRef} className={cn(className, 'bg-charcoal-4-80 backdrop-blur-md min-w-[16rem]', s.root, { hidden: !isOpen })}>
        {children}
      </div>
    </DropdownContext.Provider>
  )
};

export default Dropdown;
