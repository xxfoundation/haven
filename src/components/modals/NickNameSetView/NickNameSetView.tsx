import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from 'src/components/common';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { useUI } from 'src/contexts/ui-context';
import * as channels from 'src/store/channels';
import * as dms from 'src/store/dms';
import { useAppSelector } from 'src/store/hooks';
import * as globalSelectors from 'src/store/selectors';
import ModalTitle from '../ModalTitle';
import Input from '@components/common/Input';
import FormError from '@components/common/FormError';

const NickNameSetView: FC = () => {
  const { t } = useTranslation();
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const currentConversation = useAppSelector(dms.selectors.currentConversation);
  const { setNickname: setNickName } = useNetworkClient();
  const nickname = useAppSelector(globalSelectors.currentNickname);
  const [localNickname, setLocalNickname] = useState(nickname || '');
  const [error, setError] = useState('');
  const { closeModal } = useUI();

  const onSubmit = useCallback(() => {
    setError('');
    const success = setNickName(localNickname);
    if (success) {
      closeModal();
    } else {
      setError(t('Invalid nickname'));
    }
  }, [t, closeModal, localNickname, setNickName]);

  return (
    <>
      <ModalTitle>
        {t('Set Nickname')}
      </ModalTitle>
      <p className='text-charcoal-1'>
        {currentConversation
         ? t('Set your nickname for the {{channelName}} channel', { channelName: currentChannel?.name })
         : t('Set your nickname for all direct messages')
        }
      </p>
      <Input
        type='text'
        placeholder={t('Enter your nickname')}
        className='mt-1'
        value={localNickname}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onSubmit();
          }
        }}
        onChange={e => {
          setLocalNickname(e.target.value);
        }}
      />
      {error && (
        <FormError>
          {error}
        </FormError>
      )}
      <Button
        className='my-7'
        onClick={onSubmit}
      >
        {t('Save')}
      </Button>
    </>
  );
};

export default NickNameSetView;
