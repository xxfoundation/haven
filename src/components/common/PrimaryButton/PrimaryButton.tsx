import { FC, ButtonHTMLAttributes } from 'react';

import { Button as OriginalButton } from 'src/components/common';

export interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  cssClass?: string;
}
const PrimaryButton: FC<Props> = ({
  children,
  cssClass,
  ...rest
}) => {
  return (
    <OriginalButton
      style={{ backgroundColor: 'var(--orange)', border: 'none' }}
      cssClasses={cssClass}
      {...rest}
    >
      {children}
    </OriginalButton>
  );
};

export default PrimaryButton;
