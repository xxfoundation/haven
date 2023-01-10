import { WithChildren } from '@types';
import { FC } from 'react';
import ReactTooltip, { TooltipProps } from 'react-tooltip';

type ToolTipProps = WithChildren & {
  tooltipProps: TooltipProps;
}

const ToolTip: FC<ToolTipProps> = ({ children, tooltipProps }) => {
  return <ReactTooltip {...tooltipProps}>{children}</ReactTooltip>;
};

export default ToolTip;
