import type { FC } from 'react';
import type { WithChildren } from 'src/types';

import React from 'react';
import { ErrorBoundary as LibBoundary } from 'react-error-boundary';

type ErrorProps = {
  resetErrorBoundary: () => void;
}

const Error: FC<ErrorProps> = ({ resetErrorBoundary }) => (
  <div>
    <h2>Oops, something went wrong!</h2>
    <button
      type='button'
      onClick={resetErrorBoundary}
    >
      Try again?
    </button>
  </div>
);

const ErrorBoundary: FC<WithChildren> = ({ children }) => {
  return (
    <LibBoundary FallbackComponent={Error}>
      {children}
    </LibBoundary>
  );
}

export default ErrorBoundary;
