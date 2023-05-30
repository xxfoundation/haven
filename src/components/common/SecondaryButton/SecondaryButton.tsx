import { FC, ButtonHTMLAttributes } from 'react';

import { Button as OriginalButton } from 'src/components/common';

export interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  cssClass?: string;
}
const SecondaryButton: FC<Props> = ({
  children,
  cssClass,
  ...rest
}) => {
  return (
    <OriginalButton
      style={{ background: 'none', border: '2px solid var(--red)', color: 'var(--text-primary)' }}
      cssClasses={cssClass}
      {...rest}
    >
      {children}
    </OriginalButton>
  );
};

export default SecondaryButton;
