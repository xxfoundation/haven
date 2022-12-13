import { SVGProps } from 'react';

import s from './Ban.module.scss';

const Ban = (props: SVGProps<SVGSVGElement>) => (
  <svg 
    className={s.root}
    {...props}
    width='22px'
    height='22px'
    viewBox='0 -256 1792 1792'
    fill='var(--cyan)'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='m1280 640q0 139-71 260l-701-701q121-71 260-71 104 0 198.5 40.5 94.5 40.5 163.5 109.5 69 69 109.5 163.5 40.5 94.5 40.5 198.5zm-953-260 701 701q-121 71-260 71-104 0-198.5-40.5-94.5-40.5-163.5-109.5-69-69-109.5-163.5-40.5-94.5-40.5-198.5 0-139 71-260zm1209 260q0-209-103-385.5-103-176.5-279.5-279.5-176.5-103-385.5-103-209 0-385.5 103-176.5 103-279.5 279.5-103 176.5-103 385.5 0 209 103 385.5 103 176.5 279.5 279.5 176.5 103 385.5 103 209 0 385.5-103 176.5-103 279.5-279.5 103-176.5 103-385.5z'
      transform='matrix(1 0 0 -1 121.49153 1300.6102)'/>
  </svg>
);

export default Ban;

