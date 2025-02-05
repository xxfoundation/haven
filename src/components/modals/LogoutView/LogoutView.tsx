import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from 'src/components/common';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { useUI } from 'src/contexts/ui-context';
import useInput from 'src/hooks/useInput';

const LogoutView: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
        navigate('/');
      } else {
        setError(t('Something wrong occured! Please check your details.'));
      }
    }
  }, [t, closeModal, logout, password, navigate]);

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <h2 className="mt-9 mb-4">{t('Logout')}</h2>
      <p className="mb-8 font-medium text-xs leading-tight text-cyan max-w-[520px] text-left w-full">
        {t(`Warning: By logging out, all of you current data will be deleted from
        your browser. Please make sure you have a backup first. This can't be
        undone.`)}
      </p>
      <input
        type="password"
        className="
          mt-3 mb-4 w-full max-w-[516px]
          border-none outline-none
          bg-dark-5 px-2.5 py-[18px]
          text-text-primary text-sm
          rounded
        "
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
        <div className="text-xs mt-2 text-red w-full max-w-[516px]">
          {error}
        </div>
      )}
      <Button className="mt-6 mb-10 text-black" onClick={handleSubmit}>
        {t('Confirm')}
      </Button>
    </div>
  );
};

export default LogoutView;
