import { FC } from "react";
import s from "./Tooltip.module.scss";
import cn from "classnames";
import ReactTooltip from "react-tooltip";
import TooltipProps from "react-tooltip";

interface ToolTipProps {
  children: any;
  tooltipProps: any;
}

const ToolTip: FC<ToolTipProps> = ({ children, tooltipProps }) => {
  return <ReactTooltip {...tooltipProps}>{children}</ReactTooltip>;
};

export default ToolTip;
