import { FC, CSSProperties, createContext, useCallback, useRef, useState, useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useOnClickOutside } from 'usehooks-ts';
import { WithChildren } from '@types';
import { BaseEmoji } from 'emoji-mart';
import { AppEvents, appBus } from 'src/events';
import EmojisPickerIcon from 'src/components/icons/EmojisPicker';

type EmojiContextType = {
  openEmojiPicker: (rect: DOMRect) => void;
  isOpen: boolean;
}

const EmojiContext = createContext<EmojiContextType>({ openEmojiPicker: () => {}, isOpen: false })

export const EmojiPortal: FC<WithChildren> = ({ children }) => {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerStyle, setPickerStyle] = useState<CSSProperties>({});
  const pickerRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(pickerRef, () => setPickerVisible(false));

  const openEmojiPicker = useCallback((rect: DOMRect) => {
    setPickerStyle({
      position: 'absolute',
      zIndex: 3,
      top: Math.min(rect?.bottom + 5, window.innerHeight - 440),
      left: rect.left - 350
    })

    setPickerVisible(true);
  }, []);

  const onEmojiSelect = useCallback((e: BaseEmoji) => {
    appBus.emit(AppEvents.EMOJI_SELECTED, e.native);
  }, [])

  const emojiPortalElement = document.getElementById('emoji-portal');

  return (
    <EmojiContext.Provider value={{ openEmojiPicker, isOpen: pickerVisible }}>
      {(pickerVisible && emojiPortalElement)
        ? createPortal(
            <div
              ref={pickerRef}
              style={pickerStyle}
              className='absolute z-10'
            >
              <Picker
                data={data}
                previewPosition='none'
                onEmojiSelect={onEmojiSelect}
              />
            </div>,
            emojiPortalElement
          )
        : null}
      {children}
    </EmojiContext.Provider>
  )
}

export const EmojiPicker: FC<{ className?: string, onSelect: (emoji: string) => void }> = ({ className, onSelect }) => {
  const { isOpen, openEmojiPicker } = useContext(EmojiContext);
  const [clicked, setClicked] = useState(false);
  const iconRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setClicked(false);
    }
  }, [isOpen])

  useEffect(() => {
    const emojiListener = (emoji: string) => {
      if (clicked) {
        onSelect(emoji);
      }
    }

    appBus.addListener(AppEvents.EMOJI_SELECTED, emojiListener);

    return () => { appBus.removeListener(AppEvents.EMOJI_SELECTED, emojiListener); }
  }, [clicked, onSelect]);

  const onClick = useCallback(() => {
    setClicked(true);
    const rect = iconRef.current?.getBoundingClientRect();

    if (rect) {
      openEmojiPicker(rect);
    }
  }, [openEmojiPicker]);

  return (
    <EmojisPickerIcon className={className} ref={iconRef} onClick={onClick} />
  )
}

