import { Button } from '@components/common';
import Modal from 'src/components/modals/Modal';
import useLocalStorage from 'src/hooks/useLocalStorage';

import s from './UpdatesModal.module.scss';

const UpdatesModal = () => {
  const [showModal, setShowModal] = useLocalStorage('update-notice_0.3.1', true);
  
  return showModal ? (
    <Modal className={s.root} onClose={() => setShowModal(false)}>
      <h2 className='text-center'>Version 0.3.1</h2>
      <ul style={{ marginLeft: '-1rem'}}>
        <li className='text-center'>
          💬 Dms are finally here. Click a username to try it out. You can disable them in your channel settings.
        </li>
        <li className='text-center'>
          🔒 Control your DMs, what channels you can be DMed from and which Users can DM you
        </li>
        <li className='text-center'>
          💪 Performance enhancements for large channels.
        </li>
        <li className='text-center'>
          👀 Few UX tweaks, channel settings are now in the channel header and
          account settings are now in the top right corner.
        </li>
        <li className='text-center'>
          🪲 Fix emoji icons appearing over reply box and fix mentions dropdown appearing under the reply box.
        </li>

        <li className='text-center'>
          🌈 You can now see what color you'll get when selecting an identity.
        </li>
      </ul>
      <div className='text-center'>
        <Button onClick={() => setShowModal(false)}>Later gator.</Button>
      </div>
    </Modal>
  ) : null;
}

export default UpdatesModal;
