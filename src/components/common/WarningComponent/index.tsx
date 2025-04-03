import { FC, type PropsWithChildren } from 'react';

const WarningComponent: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className='h-screen w-full flex justify-center items-center px-20'>
      <h1
        className='headline m-auto text-center'
        style={{
          fontSize: '48px',
          color: 'var(--cyan)',
          lineHeight: '1.2'
        }}
      >
        {children}
      </h1>
    </div>
  );
};

export default WarningComponent;
