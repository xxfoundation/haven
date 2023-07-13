
import { FC, SVGProps,  useMemo } from 'react'
import cn from 'classnames';

import Checkmark from '@components/icons/Checkmark';
import X from '@components/icons/X';
import Warning from '@components/icons/Warning';


export type AlertType = {
  type: 'success' | 'error' | 'warning';
  content: string | null | React.ReactNode;
  icon?: (props: SVGProps<SVGSVGElement>) => JSX.Element;
}

const iconMap: Record<AlertType['type'], FC<SVGProps<SVGSVGElement>>> = {
  success: Checkmark,
  error: X,
  warning: Warning
}

const Alert: FC<AlertType> = ({ content, icon, type }) => {
  const Icon = useMemo(() => icon || iconMap[type], [icon, type])

  return (
    <div
      id='toast-default'
      className={cn(
      'w-full items-center space-x-4 p-4 text-near-black bg-white rounded-lg w-full flex justify-between relative transition-all',
        {
          'bg-green': type === 'success',
          'bg-orange': type === 'warning',
          'bg-red': type === 'error',
        }
      )} role='alert'
    >
      <div className='flex space-x-3 items-center'>
        <Icon className='w-5 h-5' />
        <span>{content}</span>
      </div>
    </div>
  )
};


export default Alert;
