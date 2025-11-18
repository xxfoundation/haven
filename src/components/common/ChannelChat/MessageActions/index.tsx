import React, { FC, useCallback, useEffect, useState } from 'react';
import { Delete, Reply } from 'src/components/icons';
import { Mute, Pin } from 'src/components/icons';
import { useUI } from 'src/contexts/ui-context';
import { useAppSelector } from 'src/store/hooks';
import Envelope from 'src/components/icons/Envelope';
import { userIsMuted as userIsMutedSelector } from 'src/store/selectors';
import * as dms from 'src/store/dms';
import { AppEvents, awaitAppEvent as awaitEvent } from 'src/events';
import { WithChildren } from 'src/types';
import useDmClient from 'src/hooks/useDmClient';
import { EmojiPicker } from 'src/components/common/EmojiPortal';
import Block from 'src/components/icons/Block';
import EmojisPicker from 'src/components/icons/EmojisPicker';

type Props = {
  isMuted: boolean;
  isAdmin: boolean;
  isOwn: boolean;
  isPinned: boolean;
  dmsEnabled: boolean;
  pubkey: string;
  onDmClicked: () => void;
  onReplyClicked: () => void;
  onReactToMessage: (emoji: string) => void;
  onDeleteMessage: () => void;
  onMuteUser: (unmute: boolean) => void;
  onPinMessage: (unpin?: boolean) => Promise<void>;
  onClose: () => void;
};

const MenuItem: FC<
  WithChildren & {
    onClick: () => void;
    className?: string;
    icon: React.ReactNode;
    label: string;
  }
> = ({ icon, label, onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal-1 hover:bg-charcoal-4 hover:text-primary transition-colors ${className}`}
    >
      <span className='w-5 h-5 flex items-center justify-center'>{icon}</span>
      <span>{label}</span>
    </button>
  );
};

const MessageActionsMenu: FC<Props> = ({
  dmsEnabled,
  isAdmin,
  isMuted,
  isOwn,
  isPinned,
  onDeleteMessage,
  onDmClicked,
  onMuteUser,
  onPinMessage,
  onReactToMessage,
  onReplyClicked,
  onClose,
  pubkey
}) => {
  const { toggleBlocked } = useDmClient();
  const isDms = !!useAppSelector(dms.selectors.currentConversation);
  const userIsMuted = useAppSelector(userIsMutedSelector);
  const { closeModal, openModal, setModalView } = useUI();
  const isBlocked = useAppSelector(dms.selectors.isBlocked(pubkey));

  const [loading, setLoading] = useState(false);
  const onUnpin = useCallback(async () => {
    setLoading(true);
    try {
      await onPinMessage(true);
    } catch (e) {
      setLoading(false);
      throw e;
    }
    setLoading(false);
    onClose();
  }, [onPinMessage, onClose]);

  useEffect(() => {
    if (loading) {
      setModalView('LOADING');
      openModal();
      awaitEvent(AppEvents.MESSAGE_UNPINNED).then(() => {
        closeModal();
      });
    }
  }, [closeModal, loading, openModal, setModalView]);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div className='absolute right-0 top-0 mt-1 min-w-[200px] bg-charcoal-4 rounded-lg shadow-lg border border-charcoal-3 z-50 overflow-hidden'>
      <div className='py-1'>
        <MenuItem
          icon={<Reply />}
          label='Reply'
          onClick={() => handleAction(onReplyClicked)}
        />
        <div className='px-4 py-2.5 flex items-center gap-3 text-sm text-charcoal-1 hover:bg-charcoal-4 hover:text-primary transition-colors'>
          <span className='w-5 h-5 flex items-center justify-center'>
            <EmojisPicker />
          </span>
          <EmojiPicker onSelect={(emoji) => handleAction(() => onReactToMessage(emoji))} />
        </div>
        {dmsEnabled && (
          <MenuItem
            icon={<Envelope />}
            label='Send DM'
            onClick={() => handleAction(onDmClicked)}
          />
        )}
        {isAdmin && !isOwn && (
          <MenuItem
            icon={<Mute className={isMuted ? 'text-primary' : ''} />}
            label={isMuted ? 'Unmute User' : 'Mute User'}
            onClick={() => handleAction(() => onMuteUser(isMuted))}
            className={isMuted ? 'text-primary' : ''}
          />
        )}
        {!isOwn && (
          <MenuItem
            icon={<Block className={isBlocked ? 'text-primary' : ''} />}
            label={isBlocked ? 'Unblock User' : 'Block User'}
            onClick={() => handleAction(() => toggleBlocked(pubkey))}
            className={isBlocked ? 'text-primary' : ''}
          />
        )}
        {isAdmin && !isDms && (
          <MenuItem
            icon={<Pin className={isPinned ? 'text-primary' : ''} />}
            label={isPinned ? 'Unpin Message' : 'Pin Message'}
            onClick={() => (isPinned ? onUnpin() : handleAction(() => onPinMessage()))}
            className={isPinned ? 'text-primary' : ''}
          />
        )}
        {(isOwn || isAdmin) && !isPinned && !userIsMuted && (
          <>
            <div className='h-px bg-charcoal-3 my-1' />
            <MenuItem
              icon={<Delete />}
              label='Delete Message'
              onClick={() => handleAction(onDeleteMessage)}
              className='text-red hover:text-red'
            />
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(MessageActionsMenu);
