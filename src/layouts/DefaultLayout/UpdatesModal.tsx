import { Button } from '@components/common';
import Modal from 'src/components/modals/Modal';
import useLocalStorage from 'src/hooks/useLocalStorage';

import s from './UpdatesModal.module.scss';

const UpdatesModal = () => {
  const [showModal, setShowModal] = useLocalStorage('update-notice-0.2.2', true);
  
  return showModal ? (
    <Modal className={s.root} onClose={() => setShowModal(false)}>
      <h2 className='text-center mb-8'>Welcome to version 0.2.2</h2>
      <h3>👑 Admin Commands</h3>
      <ul>
        <li>
          📌 Pinning of messages (and unpinning)
        </li>
        <li>
          🗑 Deleting of messages
        </li>
        <li>
          🔨 Muting of users (And Unmuting)
        </li>
        <li>
          👮‍♂️ Export/import channel admin keys
        </li>
      </ul>
      <h3>🛰 Channels</h3>
      <ul>
        <li>🔤 Now sort alphabetically</li>
      </ul>
      <h3>🛎 Notifications</h3>
      <ul>
        <li>📍 On message pin</li>
        <li> ↩️ On receiving a reply</li>
      </ul>
      <h3>
        🚘 Under the hood changes
      </h3>
      <ul>
        <li>
          🔗 Rewrite of connections handling code to rotate connected gateways every 10 minutes and handle disconnects more smoothly
        </li>
        <li>
          🔢 Usage of the “Subtle Crypto” library enabling larger RSA key sizes, up to 4096 bit
        </li>
      </ul>
      <h3>
        🐛 Bug fixes
      </h3>
      <ul>
        <li>😋 Fixed an issue where some emojis were broken</li>
        <li>🔗 Fixed an issue where links would break in messages</li>
        <li>🪡 Fixed an issue where newlines would disappear in messages</li>
        <li>✅ Channel name now validates correctly on creation</li>
        <li>⌨️ Fixed an issue where the send message text area would not clear correctly after sending a message with the enter key</li>
      </ul>
      <div className='text-center'>
        <Button onClick={() => setShowModal(false)}>Cool, thanks.</Button>
      </div>
    </Modal>
  ) : null;
}

export default UpdatesModal;
