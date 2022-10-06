import cn from "classnames";
import React, { FC, ReactNode, useState } from "react";
import { useSpring, a } from "@react-spring/web";
import useMeasure from "react-use-measure";
import { ResizeObserver } from "@juggle/resize-observer";
import s from "./Collapse.module.scss";
import { ArrowDown, ArrowUp } from "@components/icons";

export interface CollapseProps {
  title: string | ReactNode;
  children: ReactNode;
  icon?: "arrow-down";
  closeIcon?: "arrow-up";
  defaultActive?: boolean;
  className?: string;
}

const Collapse: FC<CollapseProps> = React.memo(
  ({
    title,
    children,
    icon = "arrow-down",
    closeIcon = "arrow-up",
    defaultActive,
    className = ""
  }) => {
    const [isActive, setActive] = useState(defaultActive);
    const [ref, { height: viewHeight }] = useMeasure({
      polyfill: ResizeObserver
    });

    const animProps = useSpring({
      height: isActive ? viewHeight : 0,
      config: { tension: 250, friction: 32, clamp: true, duration: 150 },
      opacity: isActive ? 1 : 0
    });

    const toggle = () => setActive(x => !x);
    const Icon = ({ className = "" }: { className?: string }) => {
      return <ArrowDown className={cn(s.icon, className)} />;
    };
    const CloseIcon = ({ className = "" }: { className?: string }) => {
      return <ArrowUp className={cn(s.icon, className)} />;
    };
    const IconTitle = () => {
      return (
        <>
          {!!!isActive ? <CloseIcon /> : <Icon />}
          <span className={s.label}>{title}</span>
        </>
      );
    };
    return (
      <div
        className={cn(s.root, className)}
        role="button"
        tabIndex={0}
        aria-expanded={isActive}
      >
        <div className={cn(s.header, "text--sm")} onClick={toggle}>
          <IconTitle />
        </div>
        <a.div style={{ overflow: "hidden", ...animProps }}>
          <div ref={ref} className={s.content}>
            {children}
          </div>
        </a.div>
      </div>
    );
  }
);

export default Collapse;
