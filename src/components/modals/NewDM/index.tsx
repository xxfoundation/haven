import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'src/components/common';
import { useUI } from 'src/contexts/ui-context';
import useDmClient from 'src/hooks/useDmClient';
import ModalTitle from '../ModalTitle';
import { useAppSelector } from 'src/store/hooks';
import { fullIdentity } from 'src/store/selectors';

const NewDM: FC = () => {
  const { t } = useTranslation();
  const { closeModal } = useUI();
  const { createConversation } = useDmClient();
  const [error, setError] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const user = useAppSelector(fullIdentity);

  const handleSubmit = useCallback(async () => {
    if (!inviteLink || !user) return;

    try {
      const conversation = {
        token: parseInt(inviteLink, 10),
        pubkey: user.pubkey,
        codename: user.codename,
        nickname: user.nickname,
        color: user.color || 'var(--charcoal-1)',
        codeset: user.codeset,
      };
      
      await createConversation(conversation);
      closeModal();
    } catch (e) {
      setError(t('Invalid invite link'));
    }
  }, [closeModal, createConversation, inviteLink, t, user]);

  return (
    <>
      <ModalTitle>{t('Start Direct Message')}</ModalTitle>
      <p className="mb-8 font-medium text-xs leading-tight text-cyan max-w-[520px] text-left w-full">
        {t('Enter an invite link to start a direct message conversation.')}
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
        placeholder={t('Enter invite link')}
        value={inviteLink}
        onChange={(e) => setInviteLink(e.target.value)}
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
      <Button 
        className="mt-5 w-full max-w-[520px]" 
        onClick={handleSubmit}
        disabled={!inviteLink}
      >
        {t('Start Conversation')}
      </Button>
    </>
  );
};

export default NewDM;
