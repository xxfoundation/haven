import { FC, useRef, useEffect, useCallback, ReactChildren } from "react";
import s from "./Modal.module.scss";
import { Close } from "@components/icons";
import cn from "classnames";
import {
  disableBodyScroll,
  clearAllBodyScrollLocks,
  enableBodyScroll
} from "body-scroll-lock";
interface ModalProps {
  className?: string;
  children: any;
  onClose: () => void;
  onEnter?: () => void | null;
  autoFocus?: boolean;
}

const Modal: FC<ModalProps> = ({
  children,
  onClose,
  className = "",
  autoFocus = true
}) => {
  const ref = useRef() as React.MutableRefObject<HTMLDivElement>;

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        return onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (ref.current) {
      disableBodyScroll(ref.current, { reserveScrollBarGap: true });
      window.addEventListener("keydown", handleKey);
    }
    return () => {
      if (ref && ref.current) {
        enableBodyScroll(ref.current);
      }
      clearAllBodyScrollLocks();
      window.removeEventListener("keydown", handleKey);
    };
  }, [handleKey]);

  return (
    <div className={cn(s.root)}>
      <div className={cn(s.modal, className)} role="dialog" ref={ref}>
        <Close
          onClick={() => onClose()}
          aria-label="Close panel"
          className={s.close}
        />
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
