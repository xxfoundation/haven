import { SVGProps } from 'react';

const ConnectingLine = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width='21'
      height='54'
      viewBox='0 0 21 54' fill='none' xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path d='M21 28C19.5355 28 17.2678 28 15 28C11.6863 28 9 30.6863 9 34V53' stroke='currentColor'/>
      <circle cx='9' cy='52.5' r='1.5' fill='currentColor'/>
    </svg> 
  );
};

export default ConnectingLine;
 
