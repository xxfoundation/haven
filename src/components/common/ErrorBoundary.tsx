import type { FC } from 'react';
import type { WithChildren } from 'src/types';

import React, { useCallback } from 'react';
import { ErrorBoundary as LibBoundary } from 'react-error-boundary';
import { Download } from '@components/icons';
import Button from './Button';

type ErrorProps = {
  resetErrorBoundary: () => void;
}

const ErrorComponent: FC<ErrorProps> = ({ resetErrorBoundary }) => {
  const exportLogs = useCallback(async () => {
    if (!window.getCrashedLogFile) {
      console.error('Log file required');
      throw new Error('Log file required');
    }

    const filename = 'xxdk.log';
    const data = await window.getCrashedLogFile();
    const file = new Blob([data], { type: 'text/plain' });
    const a = document.createElement('a'),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }, []);
  
  return (
    <div className='flex w-full h-screen content-center justify-center flex-col'>
      <div className='text-center space-y-2'>
        <h2 className='mb-6'>Oops, something went wrong!</h2>
        <p className='space-x-4'>
          <Button onClick={exportLogs}>
            Logs for the nerds <Download height='1rem' className='inline ml-1' />
          </Button>
          <Button
            type='button'
            onClick={resetErrorBoundary}
          >
            Try again?
          </Button>
        </p>
      </div>
    </div>
  );
};

const ErrorBoundary: FC<WithChildren> = ({ children }) => {
  return (
    <LibBoundary FallbackComponent={ErrorComponent}>
      {children}
    </LibBoundary>
  );
}

export default ErrorBoundary;
