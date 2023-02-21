import { FC, HTMLAttributes } from 'react';
import cn from 'classnames';
import s from './Spinner.module.scss';

type Size = 'lg' | 'md' | 'sm' | 'xs';

const Spinner: FC<{ size?: Size } & HTMLAttributes<SVGSVGElement>> = ({ size = 'sm', ...props }) => {
  return (
    <svg {...props} className={cn(s.spinner, s[size], props.className )} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 61.03 67.69'>
      <g id='Layer_2' data-name='Layer 2'>
        <g id='Layer_1-2' data-name='Layer 1'>
          <path className={s['stroke-1']} fill='#fff' d='M45.9,13.44a26.38,26.38,0,0,1,2.39,11c0,.12,0,.24,0,.37L61,13.48V0Z'/>
          <path className={s['stroke-2']} fill='#fff' d='M44.26,24.41C44.26,11,32.22,0,17.41,0V10.08c9,0,16.41,6.14,16.74,13.8L27.31,30A26.8,26.8,0,0,1,30.73,40.4L36.83,35C41.17,43.16,50.39,48.82,61,48.82V38.75C51.78,38.75,44.26,32.32,44.26,24.41Z'/>
          <path className={s['stroke-3']} fill='#fff' d='M26.85,43.21C26.85,29.75,14.8,18.8,0,18.8V28.88c7.86,0,14.45,4.65,16.26,10.89l-3.54,3.15h0L5.39,49.43h0L0,54.22V67.69L18.33,51.41C22.05,60.85,32,67.62,43.62,67.62V57.55C34.37,57.55,26.85,51.12,26.85,43.21Z'/>
        </g>
      </g>
    </svg>
  );
};

export default Spinner;
