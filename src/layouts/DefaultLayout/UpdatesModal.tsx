import { Button } from '@components/common';
import Modal from 'src/components/modals/Modal';
import useLocalStorage from 'src/hooks/useLocalStorage';

import s from './UpdatesModal.module.scss';

const UpdatesModal = () => {
  const [showModal, setShowModal] = useLocalStorage('update-notice_0.3.2', true);
  
  return showModal ? (
    <Modal className={s.root} onClose={() => setShowModal(false)}>
      <h2 className='text-center'>Version 0.3.2</h2>
      <ul style={{ marginLeft: '-1rem'}}>
        <li className='text-center'>
          ✏️ Message drafts persist when changing channels.
        </li>
        <li className='text-center'>
          🏪 You can now enable/disable dms when joining and creating channels.
        </li>
        <li className='text-center'>
          💬 Mentions now include user nicknames.
        </li>
      </ul>
      <div className='text-center'>
        <Button onClick={() => setShowModal(false)}>Boom boom pow.</Button>
      </div>
    </Modal>
  ) : null;
}

export default UpdatesModal;
