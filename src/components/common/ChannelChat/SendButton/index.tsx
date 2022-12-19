import { FC } from 'react';
import s from './SendButton.module.scss';
import { Elixxir } from 'src/components/icons';
import cn from 'classnames';

const SendButton: FC<{ cssClass?: string; onClick: () => void }> = ({
  cssClass,
  onClick
}) => {
  return (
    <div className={cn(s.root, cssClass)} onClick={onClick}>
      <span className='mr-1'>Send</span>
      <Elixxir />
    </div>
  );
};

export default SendButton;
