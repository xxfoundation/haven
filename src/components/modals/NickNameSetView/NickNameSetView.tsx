import { FC, useCallback, useState } from 'react';
import s from './NickNameSetView.module.scss';
import cn from 'classnames';
import { ModalCtaButton } from 'src/components/common';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { useUI } from 'src/contexts/ui-context';

const NickNameSetView: FC = () => {
  const { currentChannel, getNickName, setNickName } = useNetworkClient();
  const [nickName, setnickName] = useState(getNickName() || '');
  const [error, setError] = useState('');
  const { closeModal } = useUI();

  const onSubmit = useCallback(() => {
    setError('');
    const success = setNickName(nickName);
    if (success) {
      closeModal();
    } else {
      setError('Invalid nickname');
    }
  }, [closeModal, nickName, setNickName]);

  return (
    <div
      className={cn('w-full flex flex-col justify-center items-center', s.root)}
    >
      <h2 className='mt-9 mb-4'>Set Nickname</h2>
      <p className='mb-8 text text--xs' style={{ color: 'var(--cyan)' }}>
        Set your nickname for {currentChannel?.name || ''} channel
      </p>
      <input
        type='text'
        placeholder='Enter your nickname'
        className='mt-1'
        value={nickName}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onSubmit();
          }
        }}
        onChange={e => {
          setnickName(e.target.value);
        }}
      />
      {error && (
        <div className={'text text--xs mt-2'} style={{ color: 'var(--red)' }}>
          {error}
        </div>
      )}
      <ModalCtaButton
        buttonCopy='Save'
        cssClass='my-7'
        onClick={onSubmit}
      />
    </div>
  );
};

export default NickNameSetView;
