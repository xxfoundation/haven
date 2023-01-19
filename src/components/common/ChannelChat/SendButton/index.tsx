import { ButtonHTMLAttributes, FC } from 'react';
import s from './SendButton.module.scss';
import { Elixxir } from 'src/components/icons';
import cn from 'classnames';


const SendButton: FC<ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  return (
    <button disabled  {...props} className={cn(props.className, s.root)}>
      <span className='mr-1'>Send</span>
      <Elixxir />
    </button>
  );
};

export default SendButton;
