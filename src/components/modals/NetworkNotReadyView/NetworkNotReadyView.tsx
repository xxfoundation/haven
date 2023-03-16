import { FC } from 'react';

import cn from 'classnames';
import { useTranslation } from 'react-i18next';

const NetworkNotReadyView: FC = () => {
  const { t } = useTranslation();
  return (
    <div className={cn('w-full flex flex-col justify-center items-center')}>
      <h3 className='my-10 text-center'>
        {t('The network is getting ready, please try again shortly.')}
      </h3>
    </div>
  );
};

export default NetworkNotReadyView;
