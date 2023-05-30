import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

import s from './LogoutView.module.scss';
import cn from 'classnames';
import { PrimaryButton } from 'src/components/common';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { useUI } from 'src/contexts/ui-context';
import useInput from 'src/hooks/useInput';

const LogoutView: FC = ({}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { logout } = useNetworkClient();
  const { closeModal } = useUI();
  const [error, setError] = useState('');
  const [password, setPassword] = useInput('');

  const handleSubmit = useCallback(() => {
    if (password.length) {
      setError('');
      const result = logout(password);
      if (result) {
        closeModal();
        router.push('/');
      } else {
        setError(t('Something wrong occured! Please check your details.'));
      }
    }
  }, [
    t,
    closeModal,
    logout,
    password,
    router
  ]);

  return (
    <div
      className={cn('w-full flex flex-col justify-center items-center', s.root)}
    >
      <h2 className='mt-9 mb-4'>
        {t('Logout')}
      </h2>
      <p className='mb-8'>
        {t(`Warning: By logging out, all of you current data will be deleted from
        your browser. Please make sure you have a backup first. This can't be
        undone.`)}
      </p>
      <input
        type='password'
        className='mt-3 mb-4'
        name=''
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSubmit();
          }
        }}
        placeholder={t('Enter password')}
        value={password}
        onChange={setPassword}
      />

      {error && (
        <div
          className={cn('text text--xs mt-2', s.error)}
          style={{ color: 'var(--red)' }}
        >
          {error}
        </div>
      )}
      <PrimaryButton
        buttonCopy={t('Confirm')}
        cssClass={cn('mt-12 mb-10', s.button)}
        onClick={handleSubmit}
      />
    </div>
  );
};

export default LogoutView;
