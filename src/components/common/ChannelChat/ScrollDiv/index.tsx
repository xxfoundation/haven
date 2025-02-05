import React, {
  HTMLProps,
  useState,
  useCallback,
  useEffect,
  useRef,
  FC,
  MouseEventHandler
} from 'react';

import { useResizeObserver } from 'usehooks-ts';

const THUMB_MIN_HEIGHT = 20;

type Props = HTMLProps<HTMLDivElement> & {
  nearTop: () => void;
  nearBottom: () => void;
  autoScrollBottom: boolean;
  canSetAutoScroll: boolean;
  setAutoScrollBottom: (autoscroll: boolean) => void;
};

const ScrollDiv: FC<Props> = ({
  autoScrollBottom,
  canSetAutoScroll,
  children,
  className,
  nearBottom,
  nearTop,
  setAutoScrollBottom,
  ...rest
}) => {
  const [thumbHeight, setThumbHeight] = useState(THUMB_MIN_HEIGHT);
  const [scrollThumbTop, setThumbTop] = useState(0);
  const [lastScrollThumbPosition, setScrollThumbPosition] = useState(0);
  const [isDragging, setDragging] = useState(false);
  const scrollHostRef = useRef<HTMLDivElement>(null);
  const { width, height } = useResizeObserver<HTMLDivElement>({
    ref: scrollHostRef, box: 'border-box'  });
  const scrollThumb = useRef<HTMLDivElement>(null);

  const handleScrollThumbMouseDown = useCallback<MouseEventHandler<HTMLDivElement>>((e) => {
    e.preventDefault();
    e.stopPropagation();
    setScrollThumbPosition(e.clientY);
    setDragging(true);
  }, []);

  const handleDocumentMouseUp = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        setDragging(false);
      }
    },
    [isDragging]
  );

  const onMouseScroll = useCallback(
    (e: MouseEvent) => {
      if (scrollHostRef.current) {
        const scrollHostElement = scrollHostRef.current;
        const { offsetHeight, scrollHeight } = scrollHostElement;

        const deltaY = e.clientY - lastScrollThumbPosition;

        setScrollThumbPosition(e.clientY);

        setThumbTop(Math.min(Math.max(0, scrollThumbTop + deltaY), offsetHeight - thumbHeight));

        const percentage = deltaY * (scrollHeight / offsetHeight);
        const scrollTop = Math.min(
          scrollHostElement.scrollTop + percentage,
          scrollHeight - offsetHeight
        );

        scrollHostElement.scrollTop = scrollTop;
      }
    },
    [lastScrollThumbPosition, thumbHeight, scrollThumbTop]
  );

  const handleDocumentMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
        onMouseScroll(e);
      }
    },
    [isDragging, onMouseScroll]
  );

  const scrollToBottom = useCallback(() => {
    if (scrollHostRef.current) {
      const scrollHostElement = scrollHostRef.current;
      const { scrollHeight } = scrollHostElement;
      scrollHostElement.scrollTop = scrollHeight;
    }
  }, []);

  const setThumbPosition = useCallback(() => {
    if (!scrollHostRef.current) {
      return;
    }
    const scrollHostElement = scrollHostRef.current;
    const { offsetHeight, scrollHeight, scrollTop } = scrollHostElement;

    let newTop = (scrollTop / scrollHeight) * offsetHeight;
    newTop = Math.min(newTop, offsetHeight - thumbHeight);

    setThumbTop(newTop);
  }, [thumbHeight]);

  const onScroll = useCallback(() => {
    if (!scrollHostRef || !scrollHostRef.current || !scrollThumb.current) {
      return;
    }

    const scrollHostElement = scrollHostRef.current;
    const { offsetHeight, scrollHeight, scrollTop } = scrollHostElement;

    const scrollPercent = scrollTop / (scrollHeight - offsetHeight);

    if (scrollPercent < 0.1) {
      nearTop();
    }

    if (scrollPercent > 0.9) {
      nearBottom();
    }

    setAutoScrollBottom(canSetAutoScroll && scrollPercent === 1);
    setThumbPosition();
  }, [canSetAutoScroll, setThumbPosition, nearTop, nearBottom, setAutoScrollBottom]);

  useEffect(() => {
    if (autoScrollBottom) {
      scrollToBottom();
    }
  }, [autoScrollBottom, scrollToBottom, children]);

  const resizeScrollbar = useCallback(() => {
    if (!scrollHostRef.current) {
      return;
    }

    const scrollHostElement = scrollHostRef.current;
    const { clientHeight, scrollHeight } = scrollHostElement;
    const scrollThumbPercentage = clientHeight / scrollHeight;
    const scrollThumbHeight = Math.max(scrollThumbPercentage * clientHeight, THUMB_MIN_HEIGHT);
    setThumbHeight(scrollThumbHeight);
  }, []);

  // React to changes in the items container changing dimensions
  useEffect(() => {
    resizeScrollbar();
    setThumbPosition();
  }, [height, onScroll, resizeScrollbar, setThumbPosition]);

  useEffect(() => {
    if (!scrollHostRef.current) {
      return;
    }

    const scrollHostElement = scrollHostRef.current;
    scrollHostElement.addEventListener('scroll', onScroll, true);
    return () => {
      scrollHostElement.removeEventListener('scroll', onScroll, true);
    };
  }, [onScroll, resizeScrollbar]);

  useEffect(() => {
    // document.addEventListener('wheel', onwheel)
    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);
    document.addEventListener('mouseleave', handleDocumentMouseUp);

    return () => {
      // document.removeEventListener('wheel', onwheel);
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
      document.removeEventListener('mouseleave', handleDocumentMouseUp);
    };
  }, [handleDocumentMouseMove, handleDocumentMouseUp]);

  return (
    <div className={`
      relative h-full pr-2
      group
      ${className || ''}
    `}>
      <div 
        ref={scrollHostRef} 
        className={`
          overflow-auto h-full relative
          flex max-w-full flex-col flex-nowrap
          scrollbar-none
        `}
        {...rest}
      >
        <div className="mt-auto" ref={scrollHostRef}>
          {children}
        </div>
      </div>
      <div
        className={`
          invisible group-hover:visible
          w-2.5 h-full right-0 top-0 absolute
          rounded-lg bottom-0 bg-black/35
          ${isDragging ? '!visible' : ''}
        `}
      >
        <div
          ref={scrollThumb}
          className="w-2 ml-0.5 absolute rounded-lg opacity-100 bg-charcoal-3"
          style={{ height: thumbHeight, top: scrollThumbTop }}
          onMouseDown={handleScrollThumbMouseDown}
        />
      </div>
    </div>
  );
};

export default ScrollDiv;
