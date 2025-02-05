import type { FC, HTMLAttributes } from 'react';

import dayjs from 'dayjs';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import React from 'react';
import { Star } from 'lucide-react';

type Props = HTMLAttributes<HTMLDivElement> & {
  favorite?: boolean;
  active?: boolean;
  name: string | React.ReactNode;
  message: string;
  date?: string;
  missedMessagesCount: number;
};

const Space: FC<Props> = ({
  active,
  date,
  favorite,
  message,
  missedMessagesCount = 0,
  name,
  ...props
}) => {
  const { t } = useTranslation();

  return (
    <div 
      {...props} 
      className={cn(
        props.className,
        'px-3.5 py-3 hover:bg-charcoal-4 hover:cursor-pointer hover:rounded-[var(--border-radius)]',
        {
          'bg-charcoal-4 rounded-[var(--border-radius)]': active
        }
      )}
    >
      <div className='flex justify-between w-full items-center space-x-2'>
        <h5 className='text-sm font-bold leading-5 overflow-hidden text-ellipsis flex items-center space-x-1'>
          {name}
          {favorite && (
            <Star width='12' height='20' className='text-primary ml-1' fill='currentColor' />
          )}
        </h5>
        <div className='flex space-x-1'>
          {date ? (
            <span className='text-[0.6875rem] font-normal text-charcoal-2 tracking-[0.0275rem]'>
              {dayjs(date).format('YYYY/MM/DD')}
            </span>
          ) : (
            <span className='text-primary text-xs'>{t('New!')}</span>
          )}
        </div>
      </div>
      {message && (
        <div className='flex justify-between w-full'>
          <p className='whitespace-nowrap overflow-hidden text-ellipsis text-[0.8125rem] leading-[1.1875rem] text-charcoal-1'>
            {message}
          </p>
          {missedMessagesCount > 0 && (
            <span className='ml-1 text-[0.6875rem] tracking-[0.0275rem] py-1 px-1.5 rounded-2xl bg-charcoal-2'>
              {missedMessagesCount}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Space;
