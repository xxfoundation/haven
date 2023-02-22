import { FC } from 'react';
import { ModalCtaButton } from 'src/components/common';
import cn from 'classnames';
import { useUI } from 'src/contexts/ui-context';
import * as channels from 'src/store/channels';
import { useAppSelector } from 'src/store/hooks';

import s from './ChannelSettingsView.module.scss';
import Keys from '@components/icons/Keys';
import LockOpen from '@components/icons/LockOpen';
import CommentSlash from '@components/icons/CommentSlash';
import RightFromBracket from '@components/icons/RightFromBracket';


<ModalCtaButton
cssClass='m-2'
buttonCopy='Claim Admin Keys'
style={{ borderColor: 'var(--red)' }}

/>

const ChannelSettingsView: FC = () => {
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const { openModal, setModalView } = useUI();


  return (
    <>
      <div
        className={cn(s.root, 'w-full flex flex-col justify-center items-center')}
      >
        <h2 className='mt-9 mb-8'>Channel Settings</h2>
        <div className={s.wrapper}>
          {currentChannel?.isAdmin ? (
            <div>
              <h3 className='headline--sm'>Export Admin Keys</h3>
              <Keys
                onClick={() => {
                  setModalView('EXPORT_ADMIN_KEYS');
                  openModal();
                }}
              />
            </div>
          ) : (
            <div>
              <h3 className='headline--sm'>Claim Admin Keys</h3>
              <LockOpen onClick={() => {
                setModalView('CLAIM_ADMIN_KEYS');
                openModal();
              }} />
            </div>
          )}
          <div>
            <h3 className='headline--sm'>View Muted Users</h3>
            <CommentSlash
              onClick={() => {
                setModalView('VIEW_MUTED_USERS');
                openModal();
              }}
            />
          </div>
          <div>
            <h3 className='headline--sm'>Leave Channel</h3>
            <RightFromBracket
              onClick={() => {
                if (currentChannel) {
                  setModalView('LEAVE_CHANNEL_CONFIRMATION');
                  openModal();
                }
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChannelSettingsView;
