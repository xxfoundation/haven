import { Button } from '@components/common';
import Modal from 'src/components/modals/Modal';
import useLocalStorage from 'src/hooks/useLocalStorage';

import s from './UpdatesModal.module.scss';

const UpdatesModal = () => {
  const [showModal, setShowModal] = useLocalStorage('update-notice_0.2.8', true);
  
  return showModal ? (
    <Modal className={s.root} onClose={() => setShowModal(false)}>
      <h2 className='text-center'>Version 0.2.8 already?</h2>
      <h4 className='mb-4 text-center'>Yep. They really do grow up so fast.</h4>
      <ul style={{ marginLeft: '-1rem'}}>
        <li className='text-center'>
          🗣️ Mentions are here. Use the @ symbol to try it out.
        </li>
        <li className='text-center'>
          🧈 Infinite scrolling now feels a lot smoother.
        </li>
      </ul>
      <div className='text-center'>
        <Button onClick={() => setShowModal(false)}>Cool beans.</Button>
      </div>
    </Modal>
  ) : null;
}

export default UpdatesModal;
