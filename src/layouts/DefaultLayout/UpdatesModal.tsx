import { Button } from '@components/common';
import Modal from 'src/components/modals/Modal';
import useLocalStorage from 'src/hooks/useLocalStorage';

import s from './UpdatesModal.module.scss';

const UpdatesModal = () => {
  const [showModal, setShowModal] = useLocalStorage('update-notice_0.2.8', true);
  
  return showModal ? (
    <Modal className={s.root} onClose={() => setShowModal(false)}>
      <h2 className='text-center'>Version 0.3.0</h2>
      <ul style={{ marginLeft: '-1rem'}}>
        <li className='text-center'>
          💬 Dms are finally here. Enable it in channel settings.
        </li>
      </ul>
      <div className='text-center'>
        <Button onClick={() => setShowModal(false)}>Cool beans.</Button>
      </div>
    </Modal>
  ) : null;
}

export default UpdatesModal;
