import { FC } from 'react';
import { ModalCtaButton } from 'src/components/common';
import cn from 'classnames';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { useUI } from 'src/contexts/ui-context';

const ChannelActionsView: FC = () => {
  const { currentChannel } = useNetworkClient();
  const { openModal, setModalView } = useUI();

  return (
    <div
      className={cn('w-full flex flex-col justify-center items-center')}
    >
      <h2 className='mt-9 mb-4'>More Channel Actions</h2>
      <div className='mt-6 mb-8 flex items-center mx-auto'>
        <ModalCtaButton
          buttonCopy='Logout'
          cssClass='mr-8'
          style={{ borderColor: 'var(--red)' }}
          onClick={() => {
            setModalView('LOGOUT');
            openModal();
          }}
        />
        <ModalCtaButton
          buttonCopy='Leave'
          cssClass=''
          style={{ borderColor: 'var(--red)' }}
          disabled={!currentChannel}
          onClick={() => {
            if (currentChannel) {
              setModalView('LEAVE_CHANNEL_CONFIRMATION');
              openModal();
            }
          }}
        />
      </div>
    </div>
  );
};

export default ChannelActionsView;
