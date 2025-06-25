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
  const [touched, setTouched] = useState(false);
  const [play, setPlay] = useState<(() => void) | null>(null);
  const [stop, setStop] = useState<(() => void) | null>(null);
  const notificationSound = 'notification-sound';

  useEffect(() => {
    let mounted = true;

    const initSound = async () => {
      try {
        const [{ default: useSound }] = await Promise.all([import('use-sound')]);

        // Create and resume audio context
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const tempContext = new AudioContext();
        await tempContext.resume();

        if (!mounted) return;

        const [playFn, { stop: stopFn }] = useSound(notificationSound ?? '');
        if (mounted) {
          setPlay(() => playFn);
          setStop(() => stopFn);
        }

        // Clean up temp context
        await tempContext.close();
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };

    const handleInteraction = () => {
      initSound().catch(console.error);
      window.removeEventListener('click', handleInteraction, true);
      window.removeEventListener('touchstart', handleInteraction, true);
      window.removeEventListener('keydown', handleInteraction, true);
    };

    window.addEventListener('click', handleInteraction, true);
    window.addEventListener('touchstart', handleInteraction, true);
    window.addEventListener('keydown', handleInteraction, true);

    return () => {
      mounted = false;
      window.removeEventListener('click', handleInteraction, true);
      window.removeEventListener('touchstart', handleInteraction, true);
      window.removeEventListener('keydown', handleInteraction, true);
    };
  }, [notificationSound]);

  useEffect(() => {
    if (touched && play) {
      play();
    }
    return () => {
      if (stop) stop();
    };
  }, [play, stop, touched]);

  const selectedOption = useMemo(
    () => options.find((o) => o.value === notificationSound) ?? null,
    [notificationSound]
  );

  return (
    <div className='p-16 h-[32rem]'>
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
            setTouched(true);
            // setNotificationSound(o.value);
          }
        }}
      />
    </div>
  );
};

export default NotificationSoundSelector;
