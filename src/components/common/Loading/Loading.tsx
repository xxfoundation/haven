import type { WithChildren } from 'src/types';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from 'src/components/common';

type Props = WithChildren;

const Loading: FC<Props> = ({ children }) => {
  const { t } = useTranslation();
  return (
    <div className='w-screen h-screen flex flex-col items-center justify-center [&_svg]:fill-[var(--cyan)]'>
      <div className='flex flex-col items-center justify-center'>
        {children ? children : <Spinner size='lg' />}
        <div className='mt-2'>{t('Loading...')}</div>
      </div>
    </div>
  );
};

export default Loading;
