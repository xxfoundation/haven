import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@components/common';
import Modal from 'src/components/modals/Modal';
import { useUI } from 'src/contexts/ui-context';

const APP_VERSION = import.meta.env.APP_VERSION || 'Unknown';

/*
        <li className='text-center'>
          📣 New messages now separated by a divider so you know exactly which
          of them are new to you.
        </li>
        <li className='text-center'>
          ✉️ You can now easily create a new dm by clicking on the + button
          next to Direct Messages on the left.
        </li>
        <li className='text-center'>
          ⚠️ The text area now explicitly tells you when your message is too long.
          It also now has a maximum height so you wont lose your send button when
          trying to write your novel.
        </li>
        <li className='text-center'>
          🫡 Added a call to action to join the xxGeneralChat channel
          by adding a prompt when a user hasn't joined any channels yet.
        </li>
        <li className='text-center'>
          🐛 Fixed an issue where going to a join link without being logged in
          wouldn't ask you to join the channel after logging in.
        </li>
        <li className='text-center'>
          🧐 Dm channels now display your common channels where the description
          would be.
        </li>
*/

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
      className="
        m-4 md:w-[42rem]
        p-16 max-h-[70vh] overflow-auto
        [&>h2]:mb-10
        [&>h3]:mb-4
        [&>ul]:indent-[-1.4rem]
        [&>ul]:ml-12
        [&>ul]:mb-8
        [&>ul>li]:mb-4
      "
      onClose={closeModal}
    >
      <h2 className='text-center'>{t('Updates')}</h2>
      <p className='mb-8'>
        {t('Haven has been updated to version')} {APP_VERSION}
      </p>
      <div className='text-center'>
        <Button data-testid='updates-modal-confirm' onClick={closeModal}>
          {t('Close')}
        </Button>
      </div>
    </Modal>
  );
};

export default UpdatesModal;
