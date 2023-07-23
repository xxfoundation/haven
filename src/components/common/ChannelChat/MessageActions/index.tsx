import type { BaseEmoji } from 'emoji-mart';

import React, { FC, useCallback, useEffect, useRef, useState, HTMLAttributes, CSSProperties } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import cn from 'classnames';

import { Delete, EmojisPicker as EmojisPickerIcon, Reply } from 'src/components/icons';
import { Mute, Pin, Unpin } from 'src/components/icons';
import { useUI } from 'src/contexts/ui-context';

import classes from './MessageActions.module.scss';
import { createPortal } from 'react-dom';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import * as app from 'src/store/app';
import Envelope from '@components/icons/Envelope';
import { userIsMuted as userIsMutedSelector } from 'src/store/selectors';
import * as dms from 'src/store/dms';
import { useNetworkClient } from '@contexts/network-client-context';
import { useUtils } from '@contexts/utils-context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faCommentSlash } from '@fortawesome/free-solid-svg-icons';
import { t } from 'i18next';
import { AppEvents, awaitAppEvent as awaitEvent } from 'src/events';
import { WithChildren } from '@types';

type Props = HTMLAttributes<HTMLDivElement> & {
  isMuted: boolean;
  isAdmin: boolean;
  isOwn: boolean;
  isPinned: boolean;
  dmsEnabled: boolean;
  pubkey: string;
  onReplyClicked: () => void;
  onReactToMessage: (emoji: string) => void;
  onDeleteMessage: () => void;
  onMuteUser: () => void;
  onPinMessage: (unpin?: boolean) => Promise<void>;
}

const MessageAction: FC<WithChildren & HTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => {
  return (
    <button {...props} className={cn('text-charcoal-1 hover:text-primary w-5', props.className)}>
      {children}
    </button>
  );
}

const MessageActions: FC<Props> = ({
  dmsEnabled,
  isAdmin,
  isMuted,
  isOwn,
  isPinned,
  onDeleteMessage,
  onMuteUser,
  onPinMessage,
  onReactToMessage,
  onReplyClicked,
  pubkey,
  ...props
}) => {
  const { utils } = useUtils();
  const { dmClient } = useNetworkClient();
  const dispatch = useAppDispatch();
  const isDms = !!useAppSelector(dms.selectors.currentConversation);
  const userIsMuted = useAppSelector(userIsMutedSelector);
  const { closeModal, openModal, setLeftSidebarView: setSidebarView, setModalView } = useUI();
  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerIconRef = useRef<SVGSVGElement>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({});
  const isBlocked = useAppSelector(dms.selectors.isBlocked(pubkey));

  const listener = useCallback<(event: MouseEvent | TouchEvent) => void>((event) => {
    if (
      event.target instanceof Node && (
        pickerIconRef.current?.contains(event.target) ||
        pickerRef.current?.contains(event.target)
      )
    ) {
      return;
    }
    setPickerVisible(false);
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [listener]);

  const onEmojiSelect = useCallback((e: BaseEmoji) => {
    onReactToMessage(e.native);
  }, [onReactToMessage]);

  const [loading, setLoading] = useState(false);
  const onUnpin = useCallback(async () => {
    setLoading(true);
    try {
      await onPinMessage(true);
    } catch (e) {
      setLoading(false);
      throw e;
    }
    setLoading(false)
  }, [onPinMessage]);

  const adjustPickerPosition = useCallback(() => {
    const iconRect = pickerIconRef.current?.getBoundingClientRect();

    return iconRect && setStyle({
      position: 'absolute',
      zIndex: 3,
      top: Math.min(iconRect?.bottom + 5, window.innerHeight - 440),
      left: iconRect.left - 350
    })
  }, []);

  const dmUser = useCallback(() => {
    setSidebarView('dms');
    dispatch(app.actions.selectUser(pubkey));
  }, [dispatch, pubkey, setSidebarView])

  useEffect(() => {
    if (loading) {
      setModalView('LOADING');
      openModal();
      awaitEvent(AppEvents.MESSAGE_UNPINNED).then(() => { closeModal(); });
    }

    return () => {  };
  }, [closeModal, loading, openModal, setModalView])

  const onOpenEmojiMart = useCallback(() => {
    adjustPickerPosition();
    setPickerVisible((visibile) => !visibile);
  }, [adjustPickerPosition]);

  const blockUser = useCallback(async () => {
    const encodedKey = utils.Base64ToUint8Array(pubkey);
    await dmClient?.BlockPartner(encodedKey);
    const blocked = await dmClient?.IsBlocked(encodedKey);

    if (blocked) {
      dispatch(dms.actions.blockUser(pubkey));
    }
  }, [dispatch, dmClient, pubkey, utils]);

  const unblockUser = useCallback(async () => {
    const encodedKey = utils.Base64ToUint8Array(pubkey);
    await dmClient?.UnblockPartner(encodedKey);
    const blocked = await dmClient?.IsBlocked(encodedKey);
    if (!blocked) {
      dispatch(dms.actions.unblockUser(pubkey));
    }
  }, [dispatch, dmClient, pubkey, utils]);  

  const emojiPortalElement = document.getElementById('emoji-portal');

  return (
    <div  {...props} className={cn(props.className, 'bg-near-black-80 p-3 backdrop-blur-md space-x-4 rounded-lg')}>
      <>
        {dmsEnabled && (
          <MessageAction onClick={dmUser}>
            <Envelope />
          </MessageAction>
        )}
        {(isAdmin && !isOwn && !isMuted) && (
          <MessageAction 
            onClick={onMuteUser}>
            <Mute />
          </MessageAction>
        )}
        {isBlocked && !isOwn && (
          <MessageAction 
            onClick={unblockUser}>
            <FontAwesomeIcon
              title={t('Unblock')}
              icon={faComment}
            />
          </MessageAction>
          
        )}
        {!isBlocked && !isOwn && (
          <MessageAction 
            onClick={blockUser}>
            <FontAwesomeIcon
              title={t('Block')}
              icon={faCommentSlash}
            />
          </MessageAction>
        )}
        {(isAdmin && !isPinned && !isDms) && (
          <MessageAction onClick={() => onPinMessage()}>
            <Pin />
          </MessageAction>
        )}
        {(isAdmin && isPinned) && (
          <MessageAction onClick={onUnpin}>
            <Unpin />
          </MessageAction>
        )}
        {(isOwn || isAdmin) && !isPinned && !userIsMuted && !isDms && (
          <MessageAction 
            onClick={onDeleteMessage}>
            <Delete />
          </MessageAction>
        )}
        <MessageAction onClick={onOpenEmojiMart}>
          <EmojisPickerIcon ref={pickerIconRef} />
        </MessageAction>
        {pickerVisible && emojiPortalElement &&
          createPortal(
            <div
              ref={pickerRef}
              style={style}
              className={cn(classes.emojisPickerWrapper)}
            >
              <Picker
                data={data}
                previewPosition='none'
                onEmojiSelect={onEmojiSelect}
              />
            </div>,
            emojiPortalElement
          )
        }
        <MessageAction onClick={onReplyClicked}>
          <Reply />
        </MessageAction>
      </>
    </div>
  );
};

export default React.memo(MessageActions);
