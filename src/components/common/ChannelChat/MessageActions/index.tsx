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
import { AppEvents, awaitEvent } from 'src/events';

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
  const { closeModal, openModal, setModalView } = useUI();
  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerIconRef = useRef<HTMLDivElement>(null);
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
    dispatch(app.actions.selectUser(pubkey));
  }, [dispatch, pubkey])

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

  const blockUser = useCallback(() => {
    const encodedKey = utils.Base64ToUint8Array(pubkey);
    dmClient?.BlockSender(encodedKey);
    const blocked = dmClient?.IsBlocked(encodedKey);

    if (blocked) {
      dispatch(dms.actions.blockUser(pubkey));
    }
  }, [dispatch, dmClient, pubkey, utils]);

  const unblockUser = useCallback(() => {
    const encodedKey = utils.Base64ToUint8Array(pubkey);
    dmClient?.UnblockSender(encodedKey);
    const blocked = dmClient?.IsBlocked(encodedKey);

    if (!blocked) {
      dispatch(dms.actions.unblockUser(pubkey));
    }
  }, [dispatch, dmClient, pubkey, utils]);  

  const emojiPortalElement = document.getElementById('emoji-portal');

  return (
    <div  {...props} className={cn(props.className, classes.root)}>
      <>
        {dmsEnabled && (
          <Envelope style={{ cursor: 'pointer' }} width='20px' color='var(--cyan)' onClick={dmUser} />
        )}
        {(isAdmin && !isOwn && !isMuted) && (
          <Mute
            onClick={onMuteUser}
          />
        )}
        {isBlocked && !isOwn && (
          <FontAwesomeIcon
            color='var(--green)'
            title={t('Unblock')}
            icon={faComment}
            onClick={unblockUser}
          />
        )}
        {!isBlocked && !isOwn && (
          <FontAwesomeIcon
            style={{ color: 'var(--red)'}}
            title={t('Block')}
            icon={faCommentSlash}
            onClick={blockUser}
          />
        )}
        {(isAdmin && !isPinned && !isDms) && (
          <Pin
            onClick={() => onPinMessage()}
          />
        )}
        {(isAdmin && isPinned) && (
          <Unpin onClick={onUnpin}/>
        )}
        {(isOwn || isAdmin) && !isPinned && !userIsMuted && !isDms && (
          <Delete
            onClick={onDeleteMessage}
          />
        )}
        <div ref={pickerIconRef}>
          <EmojisPickerIcon
            onClick={onOpenEmojiMart}
          />
        </div>
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
        <Reply
          onClick={() => {
            onReplyClicked();
          }}
        />
      </>
    </div>
  );
};

export default React.memo(MessageActions);
