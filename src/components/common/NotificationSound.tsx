import { FC, useEffect, useState, lazy, Suspense } from 'react';

type Props = {
  soundUrl: string;
  onInit: (play: () => void) => void;
};

// Lazy load the sound component
const SoundPlayer = lazy(async () => {
  try {
    // First import use-sound module
    const useSound = (await import('use-sound')).default;
        
    return {
      default: function Sound({ soundUrl, onInit }: Props) {
        const [play] = useSound(soundUrl, {
          html5: true,
          preload: true,
          volume: 1.0
        });
        
        useEffect(() => {
          if (play) {
            onInit(play);
          }
        }, [play, onInit]);
        
        return null;
      }
    };
  } catch (err) {
    console.error('Error loading sound player:', err);
    // Return a fallback component that won't break
    return {
      default: () => null
    };
  }
});

const NotificationSound: FC<Props> = (props) => {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const handleInteraction = () => {
      setShouldLoad(true);
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

  if (!shouldLoad) return null;

  return (
    <Suspense fallback={null}>
      <SoundPlayer {...props} />
    </Suspense>
  );
};

export default NotificationSound; 