import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@components/common';
import Modal from 'src/components/modals/Modal';
import { useUI } from 'src/contexts/ui-context';

const APP_VERSION = import.meta.env.APP_VERSION || 'Unknown';

const UpdatesModal = () => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  const closeModal = () => {
    setShow(false);
  };

  useEffect(() => {
    const lastVersion = localStorage.getItem('version');
    if (lastVersion !== APP_VERSION) {
      setShow(true);
      localStorage.setItem('version', APP_VERSION);
    }
  }, []);

  if (!show) return null;

  return (
    <Modal
      data-testid='updates-modal'
      className='
        m-4 md:w-[42rem]
        p-16 max-h-[70vh] overflow-auto
        [&>h2]:mb-10
        [&>h3]:mb-4
        [&>ul]:indent-[-1.4rem]
        [&>ul]:ml-12
        [&>ul]:mb-8
        [&>ul>li]:mb-4
      '
      onClose={closeModal}
    >
      <h2 className='text-center'>{t('Updates')}</h2>
      <p className='mb-8'>
        {t('Haven has been updated to version')} {APP_VERSION}
      </p>
      <ul>
        <li className='text-center'>🚀 Version 0.4.0 Released</li>
        <li className='text-center'>
          ⚡ Migrated to Vite for faster development and better performance
        </li>
        <li className='text-center'>🖥️ Added full support for Internet Computer Protocol (ICP)</li>
        <li className='text-center'>📝 Fixed text formatting and editor issues</li>
        <li className='text-center'>🔒 Improved password handling and browser integration</li>
        <li className='text-center'>🏗️ Enhanced build system and code splitting</li>
      </ul>
      <div className='text-center'>
        <Button data-testid='updates-modal-confirm' onClick={closeModal}>
          {t('Close')}
        </Button>
      </div>
    </Modal>
  );
};

export default UpdatesModal;
