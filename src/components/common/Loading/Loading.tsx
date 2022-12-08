import type { WithChildren } from '@types';
import type { FC } from 'react';
import cn from 'classnames';
import s from './Loading.module.scss';
import { Spinner } from 'src/components/common';

const Elixxir = () => {
  return (
    <svg
      width='101'
      height='112'
      viewBox='0 0 101 112'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      style={{ marginBottom: '28px' }}
    >
      <path
        d='M75.4451 22.914C77.9637 28.4484 79.3633 34.5192 79.3633 40.8849C79.3633 41.0874 79.3917 41.2828 79.4024 41.4817L100.24 22.9708V0.889893L75.4451 22.914Z'
        fill='#259CDB'
      />
      <path
        d='M72.7596 40.8849C72.7596 18.8324 53.0268 0.889893 28.7719 0.889893V17.3973C43.5777 17.3973 55.6554 27.468 56.1989 40.0111L44.9844 49.9752C47.9719 55.1757 49.9292 60.9553 50.5828 67.0829L60.586 58.1951C67.6941 71.605 82.7948 80.8835 100.236 80.8835V64.3725C85.0896 64.3725 72.7596 53.8365 72.7596 40.8849Z'
        fill='#259CDB'
      />
      <path
        d='M71.7081 111.685V95.1777C56.5577 95.1777 44.2278 84.6417 44.2278 71.6901C44.2278 49.6376 24.4949 31.6951 0.23999 31.6951V48.2025C13.1134 48.2025 23.9194 55.8185 26.8856 66.0526L0.23999 89.7214V111.802L30.2816 85.1177C36.363 100.584 52.636 111.685 71.7081 111.685Z'
        fill='#259CDB'
      />
    </svg>
  );
};

type Props = WithChildren;

const Loading: FC<Props> = ({ children }) => {
  return (
    <div className={cn(s.root)}>
      <div>
        <Elixxir />
        {children ? children : <Spinner />}
      </div>
    </div>
  );
};

export default Loading;
