import { FC, useCallback } from 'react';
import s from './LeaveChannelConfirmationView.module.scss';
import cn from 'classnames';
import { ModalCtaButton } from 'src/components/common';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { useUI } from 'src/contexts/ui-context';

const LeaveChannelConfirmationView: FC = () => {
  const { currentChannel, leaveCurrentChannel } = useNetworkClient();
  const { closeModal } = useUI();

  const onLeave = useCallback(() => {
    leaveCurrentChannel();
    closeModal();
  }, [closeModal, leaveCurrentChannel]);

  return (
    <div
      className={cn('w-full flex flex-col justify-center items-center', s.root)}
    >
      <span className='text font-bold mt-9 mb-4'>
        Are you sure you want to leave {currentChannel?.name || ''} Speakeasy ?
      </span>

      <div className='flex'>
        <ModalCtaButton
          buttonCopy='Leave'
          cssClass='mt-5 mb-10 mr-5'
          style={{
            borderColor: 'var(--red)'
          }}
          onClick={onLeave}
        />
        <ModalCtaButton
          buttonCopy='Cancel'
          cssClass='mt-5 mb-10'
          onClick={closeModal}
        />
      </div>
    </div>
  );
};

export default LeaveChannelConfirmationView;
