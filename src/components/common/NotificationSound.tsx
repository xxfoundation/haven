import { FC, useEffect } from 'react';
import useSound from 'use-sound';

type Props = {
  soundUrl: string;
  onInit: (play: () => void) => void;
};

const NotificationSound: FC<Props> = ({ soundUrl, onInit }) => {
  const [play] = useSound(soundUrl, {
    html5: true,
    preload: true,
    volume: 1.0
  });

  useEffect(() => {
    console.log('[DEBUG] NotificationSound initialized, play function exists');
    onInit(play);
  }, [play, onInit]);

  return null;
};

export default NotificationSound;
