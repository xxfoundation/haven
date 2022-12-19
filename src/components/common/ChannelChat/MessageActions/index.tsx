import type { BaseEmoji } from 'emoji-mart';

import { FC, CSSProperties, useCallback, useEffect, useRef, useState, HTMLAttributes, useMemo } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import cn from 'classnames';

import { Delete, EmojisPicker as EmojisPickerIcon, Reply } from 'src/components/icons';
import { Button, Spinner } from 'src/components/common';
import { Ban, Pin } from 'src/components/icons';
import { useUI } from 'src/contexts/ui-context';

import classes from './MessageActions.module.scss';
import { createPortal } from 'react-dom';

type Props = HTMLAttributes<HTMLDivElement> & {
  isAdmin: boolean;
  isOwn: boolean;
  onReplyClicked: () => void;
  onReactToMessage: (emoji: string) => void;
  onDeleteMessage: () => void;
  onMuteUser: () => void;
  onPinMessage: (unpin?: boolean) => Promise<void>;
}

const MessageActions: FC<Props> = ({
  isAdmin,
  isOwn,
  onDeleteMessage,
  onMuteUser,
  onPinMessage,
  onReactToMessage,
  onReplyClicked,
  ...props
}) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerIconRef = useRef<HTMLDivElement>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [style, setStyle] = useState({});

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

  const { showPinned } = useUI();

  const [loading, setLoading] = useState(false);
  const onUnpin = useCallback(async () => {
    setLoading(true);
    await onPinMessage(true).finally(() => setLoading(false));
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

  const onOpenEmojiMart = useCallback(() => {
    adjustPickerPosition();
    setPickerVisible(true);
  }, [adjustPickerPosition])

  const emojiPortalElement = document.getElementById('emoji-portal');

  return (
    <div  {...props} className={cn(props.className, classes.root)}>
      {showPinned
        ?
        <>
          {isAdmin && (loading ? <Spinner /> : <Button onClick={onUnpin}>Unpin</Button>)}
        </>
        : (
        <>
          {isAdmin && !isOwn && (
            <Ban
              onClick={onMuteUser}
            />
          )}
          {(isAdmin) && (
            <Pin
              onClick={() => onPinMessage()}
            />
          )}
          {(isOwn || isAdmin) && (
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
      )}
    </div>
  );
};

export default MessageActions;
