import type { FC } from 'react';
import { Spinner } from 'src/components/common';

type Props = {
  message?: string;
}

const Loading: FC<Props> = ({ message }) => <div className='h-screen w-screen flex flex-col justify-center items-center'>
  <Spinner size='lg' />
  {message && (
    <p className='text-center mt-4'>
      {message}
    </p>
  )}
</div>;

export default Loading;
