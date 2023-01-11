import icon from 'src/assets/images/logo.svg';
import { useState, useRef, useCallback } from 'react';
import { useSessionStorage } from 'usehooks-ts';

const useNotification = () => {
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean>(Notification?.permission === 'granted');
  const notification = useRef<Notification | null>(null);
  const [permissionIgnored, setPermissionIgnored] = useSessionStorage('notifications_ignored', false);

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

  const request = useCallback(() => {
    Notification.requestPermission().then((permission) => setIsPermissionGranted(permission === 'granted'));
  }, [])

  return {
    isPermissionGranted,
    permissionIgnored,
    setPermissionIgnored,
    messagePinned,
    messageReplied,
    close,
    request,
  };
};

export default useNotification;