import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Helmet } from 'react-helmet-async';

type Props = {
  children: React.ReactNode;
};

const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <>
      <Helmet>
        <title>Error - Haven Web</title>
      </Helmet>
      <section role='alert' className='error-boundary'>
        <h2>Something went wrong:</h2>
        <pre>{error.message}</pre>
      </section>
    </>
  );
};

const ErrorBoundary: React.FC<Props> = ({ children }) => {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
