import { FC } from 'react';
import { ModalCtaButton } from 'src/components/common';
import cn from 'classnames';
import { useUI } from 'src/contexts/ui-context';
import * as channels from 'src/store/channels';
import { useAppSelector } from 'src/store/hooks';

const ChannelActionsView: FC = () => {
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const { openModal, setModalView } = useUI();

  return (
    <>
      <div
        className={cn('w-full flex flex-col justify-center items-center')}
      >
        <h2 className='mt-9 mb-4'>Channel Settings</h2>
        <div className='mt-6 mb-8 flex flex-wrap justify-center items-center mx-auto'>
          {currentChannel?.isAdmin ? (
            <ModalCtaButton
              cssClass='m-2'
              buttonCopy='Export Admin Keys'
              style={{ borderColor: 'var(--red)' }}
              onClick={() => {
                setModalView('EXPORT_ADMIN_KEYS');
                openModal();
              }}
            />
          ) : (
            <ModalCtaButton
              cssClass='m-2'
              buttonCopy='Claim Admin Keys'
              style={{ borderColor: 'var(--red)' }}
              onClick={() => {
                setModalView('CLAIM_ADMIN_KEYS');
                openModal();
              }}
            />
          )}
          <ModalCtaButton
            cssClass='m-2'
            buttonCopy='View Muted Users'
            style={{ borderColor: 'var(--red)' }}
            disabled={!currentChannel}
            onClick={() => {
              setModalView('VIEW_MUTED_USERS');
              openModal();
            }}
          />
          <ModalCtaButton
            cssClass='m-2'
            buttonCopy='Leave Channel'
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
    </>
  );
};

export default ChannelActionsView;
