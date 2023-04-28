
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Spinner } from 'src/components/common';
import { ProgressBar } from 'src/components/common';

type Props = {
  readyProgress: number;
  fullscreen?: boolean;
}

const ImportCodeNameLoading: FC<Props> = ({ readyProgress }) => {
  const { t } = useTranslation();
  return (
    <>
      <Spinner size='md' />
      <ProgressBar completed={readyProgress}></ProgressBar>
      <div className='text-center'>
        <div className='headline--md'>
          {t('Securely setting up your codename. This could take up to a minute.')}
        </div>
        <div className='headline--sm'>
          {t('Please do not close this page - your codename may be lost')}
        </div>
      </div>
    </>
  )
}

export default ImportCodeNameLoading;
