import type { WithChildren } from '@types';
import type { FC } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import s from './Loading.module.scss';
import { Spinner } from 'src/components/common';

type Props = WithChildren;

const Loading: FC<Props> = ({ children }) => {
  const { t } = useTranslation();
  return (
    <div className={cn(s.root)}>
      <div>
        {children ? children : <Spinner size='lg' />}
        <div className='mt-2'>{t('Loading...')}</div>
      </div>
    </div>
  );
};

export default Loading;
