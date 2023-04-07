import { FC, ButtonHTMLAttributes } from 'react';

import { Button } from 'src/components/common';

interface IModalCtaButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  buttonCopy: React.ReactNode;
  cssClass?: string;
}
const ModalCtaButton: FC<IModalCtaButtonProps> = ({
  buttonCopy,
  cssClass,
  ...rest
}) => {
  return (
    <Button
      style={{ backgroundColor: 'var(--orange)', border: 'none' }}
      cssClasses={cssClass}
      {...rest}
    >
      {buttonCopy}
    </Button>
  );
};

export default ModalCtaButton;
