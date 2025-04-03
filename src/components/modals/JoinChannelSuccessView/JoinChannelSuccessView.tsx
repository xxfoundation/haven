import { FC } from 'react';
import { useTranslation } from 'react-i18next';

const JoinChannelSuccessView: FC = () => {
  const { t } = useTranslation();
  return (
    <div className='w-full flex flex-col justify-center items-center'>
      <span className='text-base font-bold mt-9 mb-4'>
        {t('Awesome! You joined a new Haven Chat successfully.')}
      </span>
    </div>
  );
};

export default JoinChannelSuccessView;
