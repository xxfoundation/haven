import icon from 'src/assets/images/logo.svg';
import { useEffect, useState, useRef, useCallback } from 'react';

const useNotification = () => {
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean>(Notification?.permission === 'granted');
  const notification = useRef<Notification | null>(null);

  const notify = useCallback((title: string, options?: NotificationOptions) => {
    if (isPermissionGranted) {
      notification.current = new Notification(title, options);
    }
  }, [isPermissionGranted]);

  const messageReplied = useCallback((username: string, message: string) => {
    notify(`${username} replied to you`, {
      body: message,
      icon
    });
  }, [notify]);

  const messagePinned = useCallback((message: string, channelName: string) => {
    notify(`New message pinned in ${channelName}`, { icon, body: message });
  }, [notify])

  const close = useCallback(() => {
    notification.current?.close();
  }, []);

  useEffect(() => {
    if (!isPermissionGranted) {
      Notification.requestPermission().then((permission) => setIsPermissionGranted(permission === 'granted'));
    }
  }, [isPermissionGranted]);

  return {
    messagePinned,
    messageReplied,
    close,
  };
};

export default useNotification;