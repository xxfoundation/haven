import { useEffect, useMemo, useState, FC } from 'react';
import Select from 'react-tailwindcss-select';
import { useRemotelySynchedString } from 'src/hooks/useRemotelySynchedValue';

const options = [
  { label: 'Default', value: '/sounds/notification.mp3' },
  { label: 'Augh', value: '/sounds/augh.mp3' },
  { label: 'Parry', value: '/sounds/parry.mp3' },
  { label: 'Bring', value: '/sounds/bring.mp3' },
  { label: 'ICQ', value: '/sounds/classic-icq.wav' }
];

const NotificationSoundSelector: FC = () => {
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [playPreview, setPlayPreview] = useState<((url: string) => void) | null>(null);
  const { set: setNotificationSound, value: notificationSound } = useRemotelySynchedString(
    'notification-sound',
    '/sounds/notification.mp3'
  );

  useEffect(() => {
    const initAudio = () => {
      setAudioInitialized(true);
      setPlayPreview(() => (url: string) => {
        const audio = new Audio(url);
        audio.volume = 1.0;
        audio.play().catch((error) => {
          console.error('Failed to play preview sound:', error);
        });
      });
    };

    const handleInteraction = () => {
      initAudio();
      window.removeEventListener('click', handleInteraction, true);
      window.removeEventListener('touchstart', handleInteraction, true);
      window.removeEventListener('keydown', handleInteraction, true);
    };

    window.addEventListener('click', handleInteraction, true);
    window.addEventListener('touchstart', handleInteraction, true);
    window.addEventListener('keydown', handleInteraction, true);

    return () => {
      window.removeEventListener('click', handleInteraction, true);
      window.removeEventListener('touchstart', handleInteraction, true);
      window.removeEventListener('keydown', handleInteraction, true);
    };
  }, []);

  const selectedOption = useMemo(
    () => options.find((o) => o.value === notificationSound) ?? null,
    [notificationSound]
  );

  return (
    <div className='relative'>
      <Select
        classNames={{
          menu: 'bg-charcoal-4 py-4 rounded-xl mt-1 absolute w-full',
          menuButton: () =>
            'text-md rounded-3xl px-4 font-semibold flex bg-primary text-near-black justify-center',
          listItem: ({ isSelected } = { isSelected: false }) =>
            `block transition font-semibold duration-200 hover:bg-primary hover:text-near-black p-2 cursor-pointer select-none truncate ${
              isSelected ? ' bg-charcoal-3' : 'text-charcoal-1'
            }`
        }}
        primaryColor={'primary'}
        options={options}
        value={selectedOption}
        onChange={(o) => {
          if (o && !Array.isArray(o) && o !== null) {
            setNotificationSound(o.value);
            // Play preview immediately on selection
            if (playPreview && audioInitialized) {
              playPreview(o.value);
            }
          }
        }}
      />
    </div>
  );
};

export default NotificationSoundSelector;
