import { FC } from 'react';

import Button, { Props } from 'src/components/common/Button';

const PrimaryButton: FC<Props> = ({
  children,
  ...rest
}) => {
  return (
    <Button
      style={{ backgroundColor: 'var(--orange)', border: 'none', ...rest.style }}
      {...rest}
    >
      {children}
    </Button>
  );
};

export type { Props } from 'src/components/common/Button';

export default PrimaryButton;
