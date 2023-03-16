import { FC } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import s from './JoinChannelSuccessView.module.scss';

const JoinChannelSuccessView: FC = () => {
  const { t } = useTranslation();
  return (
    <div
      className={cn('w-full flex flex-col justify-center items-center', s.root)}
    >
      <span className='text font-bold mt-9 mb-4'>
        {t('Awesome! You joined a new speakeasy successfully.')}
      </span>
    </div>
  );
};

export default JoinChannelSuccessView;
