import type { WithChildren } from '@types'
import type { FC } from 'react'
import ErrorIcon from 'src/components/icons/Error';

const FormError: FC<WithChildren> = ({ children }) => (
  <div className='flex items-center w-full space-x-2 p-3 rounded-2xl border border-red bg-red-200' style={{ background: 'rgba(227, 48, 75, 0.15)'}}>
    <ErrorIcon className='text-red min-w-[2rem] h-8' />
    <span className='flex-grow'>{children}</span>
  </div>
);

export default FormError;
