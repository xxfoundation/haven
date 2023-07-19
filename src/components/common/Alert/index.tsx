
import React, { FC, SVGProps,  useCallback,  useMemo, useState } from 'react'
import cn from 'classnames';

import Checkmark from '@components/icons/Checkmark';
import X from '@components/icons/X';
import Warning from '@components/icons/Warning';


export type AlertType = {
  type: 'success' | 'error' | 'warning';
  content: string | null | React.ReactNode;
  icon?: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  description?: string | null | React.ReactNode;
}

const iconMap: Record<AlertType['type'], FC<SVGProps<SVGSVGElement>>> = {
  success: Checkmark,
  error: X,
  warning: Warning
}

const Alert: FC<AlertType> = ({ content, description, icon, type }) => {
  const Icon = useMemo(() => icon || iconMap[type], [icon, type]);
  const [dismissed, setDismissed] = useState(false);

  const onDismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  return (
    <div
      id='toast-default'
      className={cn(
      'w-full items-center space-x-4 p-4 text-near-black bg-white rounded-lg flex justify-between relative transition-all',
        {
          'bg-green': type === 'success',
          'bg-orange': type === 'warning',
          'bg-red': type === 'error',
          'hidden': dismissed
        }
      )} role='alert'
    >
         
      <div className='flex space-x-3 items-center'>
        <Icon className='w-6 h-6' />
        <div>
          <p className='text-lg font-medium'>{content}</p>
          {description && <p className='text-md font-normal'>{description}</p>}
        </div>
      </div>
      <X onClick={onDismiss} className='cursor-pointer hover:bg-charcoal-3-20 rounded-full right-3 absolute text-near-black w-8 h-8 p-1' />
    </div>
  )
};


export default Alert;
