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
         ⭐ Favoriting channels or dms
        </li>
        <li className='text-center'>
         🔍 You can now search through your channels, dms, or contributors.
        </li>
        <li className='text-center'>
         👨‍🦳 App state now persists, meaning it remembers your message drafts
         and which channel you were on when you reload.
        </li>
      </ul>
      <div className='text-center'>
        <Button onClick={() => setShowModal(false)}>Gotcha.</Button>
      </div>
    </Modal>
  ) : null;
}

export default UpdatesModal;
