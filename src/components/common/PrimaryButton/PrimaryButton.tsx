import { FC, ButtonHTMLAttributes } from 'react';

import { Button as OriginalButton } from 'src/components/common';

export interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  buttonCopy?: React.ReactNode;
  cssClass?: string;
}
const PrimaryButton: FC<Props> = ({
  buttonCopy,
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
      {buttonCopy || children}
    </OriginalButton>
  );
};

export default PrimaryButton;
