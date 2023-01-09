import { SVGProps } from 'react';

import s from './EmojisPicker.module.scss';

const Reply = (props: SVGProps<SVGSVGElement>) => (
  <svg
    height='16px'
    viewBox='0 0 16 16'
    width='16px'
    fill='var(--cyan)'
    className={s.root}
    {...props}
  >
    <title>Reply</title>
    <path d='M7,5V3c0-0.515-0.435-1-1-1C5.484,2,5.258,2.344,5,2.586L0.578,7C0.227,7.359,0,7.547,0,8s0.227,0.641,0.578,1L5,13.414  C5.258,13.656,5.484,14,6,14c0.565,0,1-0.485,1-1v-2h2c1.9,0.075,4.368,0.524,5,2.227C14.203,13.773,14.625,14,15,14  c0.563,0,1-0.438,1-1C16,7.083,12.084,5,7,5z' />
  </svg>
);

export default Reply;
