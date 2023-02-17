import React, { HTMLProps, useState, useCallback, useEffect, useRef, FC, MouseEventHandler } from 'react';

import cn from 'classnames';

import s from './scrolldiv.module.scss';
import { useElementSize } from 'usehooks-ts';

const SCROLL_BOX_MIN_HEIGHT = 20;

type Props = HTMLProps<HTMLDivElement> & {
  nearTop: () => void;
  nearBottom: () => void;
  autoScrollBottom: boolean,
  setAutoScrollBottom: (autoscroll: boolean) => void
};

const ScrollDiv: FC<Props> = ({ autoScrollBottom, children, className, nearBottom, nearTop, setAutoScrollBottom, ...rest }) => {
  const [scrollBoxHeight, setScrollBoxHeight] = useState(SCROLL_BOX_MIN_HEIGHT);
  const [scrollBoxTop, setScrollBoxTop] = useState(0);
  const [lastScrollThumbPosition, setScrollThumbPosition] = useState(0);
  const [isDragging, setDragging] = useState(false);
  const scrollHostRef = useRef<HTMLDivElement>(null);
  const [itemsRef, { height }] = useElementSize();
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

  const setScroll = useCallback((e: MouseEvent) => {
    if (scrollHostRef.current) {
      setAutoScrollBottom(false);
      const scrollHostElement = scrollHostRef.current;
      const { offsetHeight, scrollHeight } = scrollHostElement;
  
      const deltaY = e.clientY - lastScrollThumbPosition;
  
      setScrollThumbPosition(e.clientY);

      setScrollBoxTop(
        Math.min(
          Math.max(0, scrollBoxTop + deltaY),
          offsetHeight - scrollBoxHeight
        )
      );

      const percentage = deltaY * (scrollHeight / offsetHeight);
      const scrollTop = Math.min(
        scrollHostElement.scrollTop + percentage,
        scrollHeight - offsetHeight
      );

      scrollHostElement.scrollTop = scrollTop;
    }
  }, [lastScrollThumbPosition, scrollBoxHeight, scrollBoxTop, setAutoScrollBottom])

  const handleDocumentMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
        setScroll(e);
      }
    },
    [isDragging, setScroll]
  );

  const onScroll = useCallback(() => {
    if (!scrollHostRef || !scrollHostRef.current || !scrollThumb.current) {
      return;
    }
    console.log('SCROLLING: ON SCROLL');
    const scrollHostElement = scrollHostRef.current;
    const { offsetHeight, scrollHeight, scrollTop } = scrollHostElement;

    const scrollPercent = scrollTop / (scrollHeight - offsetHeight);
    if (scrollPercent < 0.1) {
      nearTop();
    }

    if (scrollPercent > 0.9) {
      nearBottom();
    }

    let newTop = (scrollTop / scrollHeight) * offsetHeight;
    newTop = Math.min(newTop, offsetHeight - scrollBoxHeight);

    setScrollBoxTop(newTop);
  }, [nearBottom, nearTop, scrollBoxHeight]);

  const scrollToBottom = useCallback(() => {
    console.log('SCROLLING TO BOTTOM');
    if (scrollHostRef.current) {
      const scrollHostElement = scrollHostRef.current;
      const { scrollHeight } = scrollHostElement;
      scrollHostElement.scrollTop = scrollHeight;
      onScroll();
    }
  }, [onScroll]);


  useEffect(() => {
    if (autoScrollBottom) {
      scrollToBottom();
    }
  }, [autoScrollBottom, scrollToBottom])

  const resizeScrollbar = useCallback(() => {
    if (!scrollHostRef.current) {
      return;
    }

    console.log('SCROLLING RESIZED');
    const scrollHostElement = scrollHostRef.current;
    const { clientHeight, scrollHeight } = scrollHostElement;
    const scrollThumbPercentage = clientHeight / scrollHeight;
    const scrollThumbHeight = Math.max(
      scrollThumbPercentage * clientHeight,
      SCROLL_BOX_MIN_HEIGHT
    );
    setScrollBoxHeight(scrollThumbHeight);
  }, []);

  useEffect(() => {
    resizeScrollbar();
    if (autoScrollBottom) {
      scrollToBottom();
    }
  }, [autoScrollBottom, height, resizeScrollbar, scrollToBottom])

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
    const onwheel = () => { setAutoScrollBottom(false); };
    document.addEventListener('wheel', onwheel)
    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);
    document.addEventListener('mouseleave', handleDocumentMouseUp);

    return () => {
      document.removeEventListener('wheel', onwheel);
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
      document.removeEventListener('mouseleave', handleDocumentMouseUp);
    };
  }, [handleDocumentMouseMove, handleDocumentMouseUp]);

  return (
    <div
      className={cn(s['scrollhost-container'], className)}
    >
      <div
        ref={scrollHostRef}
        className={cn(s.scrollhost)}
        {...rest}
      >
        <div ref={itemsRef}>
          {children}
        </div>
      </div>
      <div className={s['scroll-bar']} style={{ opacity: 1, visibility: isDragging ? 'visible' : undefined }}>
        <div
          ref={scrollThumb}
          className={s['scroll-thumb']}
          style={{ height: scrollBoxHeight, top: scrollBoxTop }}
          onMouseDown={handleScrollThumbMouseDown}
        />
      </div>
    </div>
  );
}

export default ScrollDiv;
