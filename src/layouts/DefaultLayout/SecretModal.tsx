import { useEffect, useMemo, useState } from 'react';
import useSound from 'use-sound';
import Select from 'react-tailwindcss-select';

import Modal from 'src/components/modals/Modal';
import useKonami from 'src/hooks/useKonamiCode';
import useToggle from 'src/hooks/useToggle';

import s from './SecretModal.module.scss';
import { useRemotelySynchedString } from 'src/hooks/useRemotelySynchedValue';

const options = [
  { label: 'Default', value: '/sounds/notification.mp3' },
  { label: 'Augh', value: '/sounds/augh.mp3' },
  { label: 'Parry', value: '/sounds/parry.mp3' },
  { label: 'Bring', value: '/sounds/bring.mp3' },
  { label: 'ICQ', value: '/sounds/classic-icq.wav' }
];

const SecretModal = () => {
  const [showModal, { toggle, toggleOff }] = useToggle();
  const [touched, setTouched] = useState(false);
  const { set: setNotificationSound, value: notificationSound } = useRemotelySynchedString('notification-sound', '/sounds/notification.mp3');
  const [play, { stop }] = useSound(notificationSound ?? '');
  const selectedOption = useMemo(
    () => options.find((o) => o.value === notificationSound) ?? null,
    [notificationSound]
  )
  
  useKonami(toggle);

  useEffect(() => {
    if (touched) {
      play();
    }

    return () => stop();
  }, [play, stop, touched])

  return showModal ? (
    <Modal className={s.root} onClose={toggleOff}>
      <h2 className='text-center mb-8'>Secret Menu</h2>
      <div className='flex justify-between items-center h-20'>
        <h3>Notification Sound</h3>
        <div>
          <Select primaryColor='orange' options={options} value={selectedOption} onChange={(o) => {
            if (o && !Array.isArray(o) && o !== null) {
              setTouched(true);
              setNotificationSound(o.value);
            }
          }} />
        </div>
      </div>
    </Modal>
  ) : null;
}

export default SecretModal;
