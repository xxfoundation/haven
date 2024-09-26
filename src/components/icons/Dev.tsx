import { SVGProps } from 'react';

const Dev = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill='currentColor'
      viewBox='0 0 256 256'
      xmlns='http://www.w3.org/2000/svg'
      {...props}  
    >
      <path d='M66.56055,91.07324,22.24805,128l44.3125,36.92676a4.00015,4.00015,0,0,1-5.1211,6.14648l-48-40a4.00042,4.00042,0,0,1,0-6.14648l48-40a4.00015,4.00015,0,0,1,5.1211,6.14648Zm176,33.85352-48-40a4.00015,4.00015,0,0,0-5.1211,6.14648L233.752,128l-44.3125,36.92676a4.00015,4.00015,0,0,0,5.1211,6.14648l48-40a4.00042,4.00042,0,0,0,0-6.14648ZM161.36719,36.24121a3.99793,3.99793,0,0,0-5.12647,2.3916l-64,176a4.00017,4.00017,0,1,0,7.51856,2.73438l64-176A4.00015,4.00015,0,0,0,161.36719,36.24121Z'/>
    </svg>
  );
};

export default Dev;
