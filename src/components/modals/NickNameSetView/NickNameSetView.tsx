import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'src/components/common';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { useUI } from 'src/contexts/ui-context';
import useInput from 'src/hooks/useInput';
import ModalTitle from '../ModalTitle';

const NickNameSetView: FC = () => {
  const { t } = useTranslation();
  const { closeModal } = useUI();
  const { setNickname } = useNetworkClient();
  const [nickname, setNicknameValue] = useInput('');
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async () => {
    if (nickname.length) {
      try {
        setNickname(nickname);
        closeModal();
      } catch (e) {
        setError(t('Something wrong happened, please try again.'));
      }
    }
  }, [closeModal, nickname, setNickname, t]);

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <ModalTitle>{t('Set Nickname')}</ModalTitle>
      <p className="mb-8 font-medium text-xs leading-tight text-cyan max-w-[520px] text-left w-full">
        {t('Set a nickname to make yourself more recognizable to others.')}
      </p>
      <input
        type="text"
        className="
          w-full max-w-[520px]
          border-none outline-none
          bg-dark-5 px-2.5 py-[18px]
          text-text-primary text-sm
          rounded mb-6
        "
        placeholder={t('Enter nickname')}
        value={nickname}
        onChange={setNicknameValue}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSubmit();
          }
        }}
      />
      {error && (
        <div className="text-xs mt-2 text-red w-full max-w-[520px]">
          {error}
        </div>
      )}
      <Button className="mt-5 w-full max-w-[520px]" onClick={handleSubmit}>
        {t('Set Nickname')}
      </Button>
    </div>
  );
};

export default NickNameSetView;
