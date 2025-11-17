import { createContext, FC, useContext, useState, useCallback } from 'react';
import { useRemotelySynchedString } from 'src/hooks/useRemotelySynchedValue';
import NotificationSound from '@components/common/NotificationSound';

type SoundContextType = {
  playNotification: (() => void) | null;
};

const SoundContext = createContext<SoundContextType>({ playNotification: null });

export const SoundProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playNotification, setPlayNotification] = useState<(() => void) | null>(null);
  const { value: notificationSound } = useRemotelySynchedString(
    'notification-sound',
    '/sounds/notification.mp3'
  );

  const handleSetPlayNotification = useCallback((play: () => void) => {
    setPlayNotification(() => play);
  }, []);

  return (
    <SoundContext.Provider value={{ playNotification }}>
      <NotificationSound soundUrl={notificationSound ?? '/sounds/notification.mp3'} onInit={handleSetPlayNotification} />
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
