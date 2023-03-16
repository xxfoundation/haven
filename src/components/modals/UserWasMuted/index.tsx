import { FC } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

const UserWasMuted: FC = () => {
  const { t } = useTranslation();
  return (
    <div className={cn('w-full flex flex-col justify-center items-center')}>
      <h2 className='my-10'>
        {t('Error')}
      </h2>
      <p className='mb-12'>
        {t('You have been muted by an admin and cannot send messages.')}
      </p>
    </div>
  );
};

export default UserWasMuted;
