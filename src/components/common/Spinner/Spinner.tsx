import { FC } from 'react';
import s from './Spinner.module.scss';

const Spinner: FC<{}> = ({}) => {
  return (
    <div className={s['lds-ring']}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default Spinner;
