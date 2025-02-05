import { WithChildren } from 'src/types';
import React, {
  FC,
  HTMLAttributes,
  MouseEventHandler,
  SVGProps,
  createContext,
  useCallback,
  useContext,
  useRef
} from 'react';
import { useOnClickOutside } from 'usehooks-ts';

type CTX = { isOpen: boolean; close: () => void };
const DropdownContext = createContext<CTX>({} as CTX);

type DropdownItemProps = WithChildren &
  HTMLAttributes<HTMLButtonElement> & {
    icon?: FC<SVGProps<SVGSVGElement>> | FC<{ className?: string }>;
  };

export const DropdownItem: FC<DropdownItemProps> = ({
  children,
  icon: Icon,
  onClick: _onClick,
  ...props
}) => {
  const { close } = useContext(DropdownContext);
  const onClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (evt) => {
      if (_onClick) {
        _onClick(evt);
        close();
      }
    },
    [close, _onClick]
  );

  return (
    <li className="list-none list-item">
      <button
        {...props}
        className={`
          flex items-center self-stretch w-full
          py-2 pl-4 pr-8
          text-sm font-medium tracking-[0.00875rem]
          text-white hover:text-primary
          hover:bg-charcoal-3 hover:cursor-pointer
          group space-x-2
          ${props.className || ''}
        `}
        onClick={onClick}
      >
        {Icon && <Icon className="w-9 h-9 text-charcoal-1 group-hover:text-primary" />}
        <span>{children}</span>
      </button>
    </li>
  );
};

type Props = WithChildren & {
  isOpen: boolean;
  onChange: (isOpen: boolean) => void;
  className?: string;
};

const Dropdown: FC<Props> = ({ children, className, isOpen, onChange }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => onChange(false), [onChange]);
  useOnClickOutside(dropdownRef, (e) => {
    const target = e.target as HTMLElement;
    const isTriggerButton = target.closest('[data-dropdown-trigger]');
    if (!isTriggerButton) {
      close();
    }
  });

  return (
    <DropdownContext.Provider value={{ isOpen, close }}>
      <div
        ref={dropdownRef}
        className={`
          absolute right-0 top-full
          min-w-[16rem] z-10
          rounded-xl shadow-lg
          py-4
          bg-charcoal-4-80 backdrop-blur-md
          ${!isOpen ? 'hidden' : ''}
          ${className || ''}
        `}
      >
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

export default Dropdown;
