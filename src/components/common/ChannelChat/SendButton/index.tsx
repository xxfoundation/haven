import { ButtonHTMLAttributes, FC } from 'react';
import s from './SendButton.module.scss';
import { Elixxir } from 'src/components/icons';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';


const SendButton: FC<ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  const { t } = useTranslation();
  return (
    <button data-testid='textarea-send-button' disabled  {...props} className={cn(props.className, s.root)}>
      <span className='mr-1'>
        {t('Send')}
      </span>
      <Elixxir />
    </button>
  );
};

export default SendButton;
