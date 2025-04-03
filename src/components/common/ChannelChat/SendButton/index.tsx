import { ButtonHTMLAttributes, FC } from 'react';
import Send from '@components/icons/Send';

const SendButton: FC<ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  return (
    <button
      data-testid='textarea-send-button'
      {...props}
      className={`
        cursor-pointer outline-none border-none
        flex items-center
        text-primary text-base font-bold
        disabled:text-red disabled:cursor-not-allowed
        [&_svg]:fill-primary [&_path]:fill-primary
        disabled:[&_svg]:fill-red disabled:[&_path]:fill-red
        ${props.className || ''}
      `}
    >
      <span className='mr-1'>
        <Send />
      </span>
    </button>
  );
};

export default SendButton;
