import { SVGProps } from 'react';

const Italics = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width='18'
      height='18'
      viewBox='0 0 18 18'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <g id='Icon'>
        <path
          id='vector'
          fillRule='evenodd'
          clip-rule='evenodd'
          d='M14.0359 3.00009H11.0442C11.0386 2.99997 11.0331 2.99997 11.0276 3.00009H7.6073C7.40019 3.00009 7.2323 3.16799 7.2323 3.37509C7.2323 3.5822 7.40019 3.75009 7.6073 3.75009H10.4898L6.49255 14.143H3.75C3.54289 14.143 3.375 14.3108 3.375 14.518C3.375 14.7251 3.54289 14.893 3.75 14.893H6.74107C6.74705 14.8931 6.75302 14.8931 6.75898 14.893H10.1786C10.3857 14.893 10.5536 14.7251 10.5536 14.518C10.5536 14.3108 10.3857 14.143 10.1786 14.143H7.29612L11.2934 3.75009H14.0359C14.243 3.75009 14.4109 3.5822 14.4109 3.37509C14.4109 3.16799 14.243 3.00009 14.0359 3.00009Z'
          fill='currentColor'
        />
      </g>
    </svg>
  );
};

export default Italics;