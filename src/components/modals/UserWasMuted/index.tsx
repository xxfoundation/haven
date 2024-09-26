import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ModalTitle from '../ModalTitle';

const UserWasMuted: FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <ModalTitle>
        {t('Error')}
      </ModalTitle>
      <p className='mb-12'>
        {t('You have been muted by an admin and cannot send messages.')}
      </p>
    </>
  );
};

export default UserWasMuted;
