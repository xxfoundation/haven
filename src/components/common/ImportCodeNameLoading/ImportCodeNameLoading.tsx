
import { FC } from 'react';

import { Loading } from 'src/components/common';
import { ProgressBar } from 'src/components/common';

type Props = {
  readyProgress: number;
  fullscreen?: boolean;
}

const ImportCodeNameLoading: FC<Props> = ({ readyProgress }) => (
  <Loading>
    <ProgressBar completed={readyProgress}></ProgressBar>
    <div className='text-center'>
      <div className='headline--md'>
        Securely setting up your codename. This could take up to a minute.
      </div>
      <div className='headline--sm'>
        Please do not close this page - your codename may be lost
      </div>
    </div>
  </Loading>
);

export default ImportCodeNameLoading;
