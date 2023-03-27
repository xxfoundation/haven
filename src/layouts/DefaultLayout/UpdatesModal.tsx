import { Button } from '@components/common';
import Modal from 'src/components/modals/Modal';
import useLocalStorage from 'src/hooks/useLocalStorage';

import s from './UpdatesModal.module.scss';

const UpdatesModal = () => {
  const [showModal, setShowModal] = useLocalStorage(`update-notice_${process.env.NEXT_PUBLIC_APP_VERSION}`, true);
  
  return showModal ? (
    <Modal className={s.root} onClose={() => setShowModal(false)}>
      <h2 className='text-center'>Version {process.env.NEXT_PUBLIC_APP_VERSION}</h2>
      <ul style={{ marginLeft: '-1rem'}}>
        <li className='text-center'>
         😜 Emoji toolbar button
        </li>
        <li className='text-center'>
          🤙 Emoji codes such as :+1: will have autocomplete.
        </li>
        <li className='text-center'>
         🪳 Input lag introduced in 0.3.2 is now fixed.
        </li>
      </ul>
      <div className='text-center'>
        <Button onClick={() => setShowModal(false)}>Boom boom pow.</Button>
      </div>
    </Modal>
  ) : null;
}

export default UpdatesModal;
