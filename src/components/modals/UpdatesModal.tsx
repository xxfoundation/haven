import cn from 'classnames';
import { Button } from '@components/common';
import Modal from 'src/components/modals/Modal';
import useLocalStorage from 'src/hooks/useLocalStorage';

import s from './UpdatesModal.module.scss';

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
  const [showModal, setShowModal] = useLocalStorage(
    `update-notice_${process.env.NEXT_PUBLIC_APP_VERSION}`,
    true
  );

  return showModal ? (
    <Modal
      data-testid='updates-modal'
      className={cn(s.root, 'm-4 md:w-[42rem]')}
      onClose={() => setShowModal(false)}
    >
      <h2 className='text-center'>Version {process.env.NEXT_PUBLIC_APP_VERSION}</h2>
      <ul style={{ marginLeft: '-1rem' }}>
        <li className='text-center'>⭐ Automatically join xxGeneralChat</li>
        <li className='text-center'>
          🔍 Haven links now have previews when you send them via social media
        </li>
        <li className='text-center'>
          👨‍🦳 Update to xxdk-wasm v0.3.22, which should improve time to initialize a new user
          codename
        </li>
      </ul>
      <div className='text-center'>
        <Button data-testid='updates-modal-confirm' onClick={() => setShowModal(false)}>
          Big ups!
        </Button>
      </div>
    </Modal>
  ) : null;
};

export default UpdatesModal;
