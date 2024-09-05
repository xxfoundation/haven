
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { faRadiation } from '@fortawesome/free-solid-svg-icons';

import { Button, Spinner } from '@components/common';
import { Download } from '@components/icons';
import SoundSelector from '@components/common/NotificationSoundSelector';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRemoteStore } from '@contexts/remote-kv-context';
import useAccountSync from 'src/hooks/useAccountSync';
import { decoder } from '@utils/index';

const DeveloperOptionsView = () => {
  const { t } = useTranslation();
  const [remoteStore]= useRemoteStore();
  const { isSynced } = useAccountSync();
  const [currentFiles, setCurrentFiles] = useState<string>();
  const [deleteLoading, setDeleteLoading] = useState(false);

  // TODO: Remove speakeasyapp, this should be done via the npm package.
  const printCurrentFiles = useCallback(
    async (folder = 'speakeasyapp') => { 
      setDeleteLoading(true);
      try {
        await remoteStore?.ReadDir(folder)
          .then((v) => setCurrentFiles(decoder.decode(v)));
      } catch (e) {
        console.error('Deleting remote store failed', e);
      }
      setDeleteLoading(false);
    },
    [remoteStore]
  );

  useEffect(() => {
    if (remoteStore) {
      printCurrentFiles();
    }
  }, [printCurrentFiles, remoteStore]);

  const nukeRemoteStore = useCallback(async () => {
    setDeleteLoading(true);
    try {
      await remoteStore?.DeleteAll();
      await printCurrentFiles();
    } catch (e) {
      console.error('Delete failed', e);
    }
    setDeleteLoading(false);
  }, [printCurrentFiles, remoteStore]);

  const exportLogs = useCallback(async () => {
    if (!window.logger) {
      throw new Error(t('Log file required'));
    }

    const filename = 'xxdk.log';
    const data = await window.logger.GetFile();
    const file = new Blob([data], { type: 'text/plain' });
    const a = document.createElement('a'),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }, [t]);


  return (
    <>
      <h2>{t('Developer Options')}</h2>
      <hr className='w-full my-10 border-charcoal-3' />
      <div className='space-y-12'>
        <div className='flex justify-between items-center'>
          <h3 className='headline--sm'>{t('Logs')}</h3>
          <Button className='text-center space-x-2' onClick={exportLogs}>
            <span>{t('Download')}</span>
            <Download className='inline w-5 h-5' />
          </Button>
        </div>
        <div className='flex justify-between items-center'>
          <h3 className='headline--sm'>{t('Notification Sound')}</h3>
          <div>
            <SoundSelector />
          </div>
        </div>
        <div className='flex justify-between items-center'>
          <h3 className='headline--sm'>
            {t('Remote Store')}
          </h3>
          <div>
            {isSynced
              ? (
                <Button className='flex items-center justify-center space-x-4' onClick={nukeRemoteStore}>
                  <FontAwesomeIcon className='w-5 h-5' icon={faRadiation} />
                  <span>{t('Nuke')}</span>
                  <FontAwesomeIcon className='w-5 h-5' icon={faRadiation} />
                </Button>
              )
              : t('Not synced')
            }
          </div>
        </div>
        {isSynced && (
          <>
            {deleteLoading ? <Spinner size='md' /> : (
              <div>
                <h3 className='headline--sm mb-8'>
                  {t('App Directory Contents')}
                </h3>
                <div className='overflow-auto w-full'>
                  <code className='m-h-12 bg-charcoal-4 p-4 rounded-lg block overflow-auto w-full'>
                    {currentFiles}
                  </code>
                </div>
              </div>
            )}
          </>
        )}
        
      </div>
    </>
  )
}

export default DeveloperOptionsView;
