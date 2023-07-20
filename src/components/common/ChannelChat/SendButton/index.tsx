import { ButtonHTMLAttributes, FC } from 'react';
import s from './SendButton.module.scss';
import cn from 'classnames';
import Send from '@components/icons/Send';

const SendButton: FC<ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  return (
    <button data-testid='textarea-send-button'  {...props} className={cn(props.className, s.root)}>
      <span className='mr-1'>
        <Send />
      </span>
    </button>
  );
};

export default SendButton;
