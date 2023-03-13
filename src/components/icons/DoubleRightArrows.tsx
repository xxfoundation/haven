import { SVGProps } from 'react';

const DoubleRightyArrows = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width='19'
    height='17'
    viewBox='0 0 19 17'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    style={{
      transform: 'scale(-1,1)'
    }}
    {...props}
  >
    <path
      d='M0.125725 8.51066L7.41054 16.8591L10.395 14.2563L5.3813 8.51066L10.395 2.76497L7.41054 0.162212L0.125725 8.51066Z'
      fill='var(--cyan)'
    />
    <path
      d='M8.6264 8.51066L15.9112 16.8591L18.8956 14.2563L13.882 8.51066L18.8956 2.76497L15.9112 0.162212L8.6264 8.51066Z'
      fill='var(--cyan)'
    />
  </svg>
);

export default DoubleRightyArrows;
