import { FC } from 'react';

import Button, { Props } from 'src/components/common/Button';

const SecondaryButton: FC<Props> = ({
  children,
  ...rest
}) => {
  return (
    <Button
      style={{ background: 'none', border: '2px solid var(--red)', color: 'var(--text-primary)' }}
      {...rest}
    >
      {children}
    </Button>
  );
};

export type { Props } from 'src/components/common/Button';

export default SecondaryButton;
