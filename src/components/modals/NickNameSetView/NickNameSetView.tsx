import { FC, useCallback, useState } from 'react';
import s from './NickNameSetView.module.scss';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import { PrimaryButton } from 'src/components/common';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { useUI } from 'src/contexts/ui-context';
import * as channels from 'src/store/channels';
import * as dms from 'src/store/dms';
import { useAppSelector } from 'src/store/hooks';
import * as globalSelectors from 'src/store/selectors';

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
    <div
      className={cn('w-full flex flex-col justify-center items-center', s.root)}
    >
      <h2 className='mt-9 mb-4'>
        {t('Set Nickname')}
      </h2>
      <p className='mb-8 text text--xs' style={{ color: 'var(--cyan)' }}>
        {currentConversation
         ? t('Set your nickname for the {{channelName}} channel', { channelName: currentChannel?.name })
         : t('Set your nickname for all direct messages')
        }
      </p>
      <input
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
        <div className={'text text--xs mt-2'} style={{ color: 'var(--red)' }}>
          {error}
        </div>
      )}
      <PrimaryButton
        className='my-7'
        onClick={onSubmit}
      >
        {t('Save')}
      </PrimaryButton>
    </div>
  );
};

export default NickNameSetView;
