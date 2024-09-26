import { useEffect, useMemo, useState } from 'react';
import useSound from 'use-sound';
import Select from 'react-tailwindcss-select';
import { useRemotelySynchedString } from 'src/hooks/useRemotelySynchedValue';

const options = [
  { label: 'Default', value: '/sounds/notification.mp3' },
  { label: 'Augh', value: '/sounds/augh.mp3' },
  { label: 'Parry', value: '/sounds/parry.mp3' },
  { label: 'Bring', value: '/sounds/bring.mp3' },
  { label: 'ICQ', value: '/sounds/classic-icq.wav' }
];

const SoundSelector = () => {
  const [touched, setTouched] = useState(false);
  const { set: setNotificationSound, value: notificationSound } = useRemotelySynchedString('notification-sound', '/sounds/notification.mp3');
  const [play, { stop }] = useSound(notificationSound ?? '');
  const selectedOption = useMemo(
    () => options.find((o) => o.value === notificationSound) ?? null,
    [notificationSound]
  )

  useEffect(() => {
    if (touched) {
      play();
    }

    return () => stop();
  }, [play, stop, touched])

  return (
    <Select
      classNames={{
        menu: 'bg-charcoal-4 py-4 rounded-xl mt-1 absolute w-full',
        menuButton: () => 'text-md rounded-3xl px-4 font-semibold flex bg-primary text-near-black justify-center',
        listItem: ({ isSelected }) => (
          `block transition  font-semibold duration-200 hover:bg-primary hover:text-near-black p-2 cursor-pointer select-none truncate ${
              isSelected
                  ? ' bg-charcoal-3'
                  : 'text-charcoal-1'
          }`
      )
      }}
      primaryColor={'primary'}
      options={options}
      value={selectedOption}
      onChange={(o) => {
      if (o && !Array.isArray(o) && o !== null) {
        setTouched(true);
        setNotificationSound(o.value);
      }
    }} />
  )
}

export default SoundSelector;
