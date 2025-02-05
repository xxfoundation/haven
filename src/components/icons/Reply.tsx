import { SVGProps } from 'react';

const Reply = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="hover:scale-110 cursor-pointer transition-transform"
    {...props}
  >
    <g id="Icon">
      <path
        id="vector"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.4056 5.03807C10.5925 5.11547 10.7143 5.29778 10.7143 5.50001V8.42859H11.3571C14.4285 8.42859 16.2869 9.9854 17.4973 11.9523C18.4459 13.4938 19.0183 15.3289 19.4933 16.8517C19.6106 17.2276 19.7219 17.5846 19.8315 17.9133C19.9024 18.126 19.8231 18.3598 19.6375 18.4855C19.4519 18.6111 19.2053 18.5979 19.0342 18.4532C18.5469 18.0409 18.1183 17.6687 17.7317 17.333C16.7632 16.492 16.0577 15.8794 15.3494 15.4352C14.4111 14.8468 13.485 14.5714 11.9286 14.5714H10.7143V17.5C10.7143 17.7066 10.5873 17.8919 10.3946 17.9664C10.2019 18.0409 9.98327 17.9892 9.84432 17.8364L4.13003 11.5506C3.9505 11.3531 3.95772 11.0495 4.14645 10.8607L9.86073 5.14646C10.0037 5.00346 10.2188 4.96068 10.4056 5.03807ZM5.19067 11.2307L9.71429 16.2067V14.0714C9.71429 13.7953 9.93814 13.5714 10.2143 13.5714H11.9286C13.6385 13.5714 14.7563 13.8829 15.8806 14.588C16.6319 15.0591 17.3951 15.7155 18.3468 16.5419C17.9153 15.1789 17.4169 13.7297 16.6456 12.4763C15.5703 10.7289 14.0001 9.42859 11.3571 9.42859H10.2143C9.93814 9.42859 9.71429 9.20473 9.71429 8.92859V6.70712L5.19067 11.2307Z"
        fill="currentColor"
      />
    </g>
  </svg>
);

export default Reply;
