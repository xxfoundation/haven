import { SVGProps } from 'react';
import cn from 'classnames';

const Keys = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 128 128'
      {...props}
      className={cn(props.className, 'p-1')}
    >
      <path
        d='M 86 1 C 63.4 1 45 19.4 45 42 C 45 64.6 63.4 83 86 83 C 108.6 83 127 64.6 127 42 C 127 19.4 108.6 1 86 1 z M 86 7 C 105.3 7 121 22.7 121 42 C 121 61.3 105.3 77 86 77 C 66.7 77 51 61.3 51 42 C 51 22.7 66.7 7 86 7 z M 86 32 A 10 10 0 0 0 76 42 A 10 10 0 0 0 86 52 A 10 10 0 0 0 96 42 A 10 10 0 0 0 86 32 z M 42.363281 62.599609 C 41.600781 62.599609 40.850781 62.9 40.300781 63.5 L 1.9003906 101.90039 C 1.3003906 102.40039 1 103.2 1 104 L 1 124 C 1 125.7 2.3 127 4 127 L 24 127 C 25.7 127 27 125.7 27 124 L 27 107 L 44 107 C 45.7 107 47 105.7 47 104 L 47 87 L 61 87 C 62.7 87 64 85.7 64 84 C 64 82.3 62.7 81 61 81 L 44 81 C 42.3 81 41 82.3 41 84 L 41 101 L 24 101 C 22.3 101 21 102.3 21 104 L 21 121 L 7 121 L 7 105.19922 L 44.5 67.699219 C 45.7 66.499219 45.7 64.6 44.5 63.5 C 43.9 62.9 43.125781 62.599609 42.363281 62.599609 z'
        fill='currentColor'
      />
    </svg>
  );
};

export default Keys;
