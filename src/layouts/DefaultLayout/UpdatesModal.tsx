import { Button } from '@components/common';
import Modal from 'src/components/modals/Modal';
import useLocalStorage from 'src/hooks/useLocalStorage';

import s from './UpdatesModal.module.scss';

const UpdatesModal = () => {
  const [showModal, setShowModal] = useLocalStorage('update-notice_0.2.5', true);
  
  return showModal ? (
    <Modal className={s.root} onClose={() => setShowModal(false)}>
      <h2 className='text-center mb-8'>Welcome to version 0.2.5</h2>
      <ul>
        <li>
          ⚡ Text is coming alive with this update through supporting rich text formatting.
        </li>
        <li>
          🌑 Whitespace now preserved in messages.
        </li>
        <li>
          🐛 Fixed a bug where messages werent deleted until you reloaded the browser.
        </li>
      </ul>
      <div className='text-center'>
        <Button onClick={() => setShowModal(false)}>Cool, thanks.</Button>
      </div>
    </Modal>
  ) : null;
}

export default UpdatesModal;
