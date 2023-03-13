import icon from 'src/assets/images/logo.svg';
import { useRef, useCallback } from 'react';
import { useLocalStorage, useSessionStorage } from 'usehooks-ts';
import useSound from 'use-sound';
import { convert } from 'html-to-text';

import { inflate } from '@utils/index';

const getText = (content: string) => {
  let text = ''; 
  try {
    text = convert(inflate(content));
  } catch (e) {
    text = content;
  }
  return text;
}

const useNotification = () => {
  const [notificationSound] = useLocalStorage('notification-sound', '/sounds/notification.mp3');
  const [playNotification] = useSound(notificationSound);
  const [isPermissionGranted, setIsPermissionGranted] = useLocalStorage<boolean>('notification-permission', Notification?.permission === 'granted');
  const notification = useRef<Notification | null>(null);
  const [permissionIgnored, setPermissionIgnored] = useSessionStorage('notifications_ignored', false);

  const notify = useCallback((title: string, options?: NotificationOptions) => {
    if (isPermissionGranted) {
      notification.current = new Notification(title, options);
      playNotification();
    }
  }, [isPermissionGranted, playNotification]);

  const messageReplied = useCallback((username: string, message: string) => {
    notify(`${username} replied to you`, {
      body: getText(message),
      icon
    });
  }, [notify]);

  const notifyMentioned = useCallback((username: string, message: string) => {
    notify(`${username} mentioned you`, {
      body: getText(message),
      icon
    });
  }, [notify])

  const messagePinned = useCallback((message: string, channelName: string) => {
    notify(`New message pinned in ${channelName}`, { icon, body: getText(message) });
  }, [notify]);

  const close = useCallback(() => {
    notification.current?.close();
  }, []);

  const request = useCallback(() => {
    Notification.requestPermission()
      .then((permission) => setIsPermissionGranted(permission === 'granted'));
  }, [setIsPermissionGranted]);

  const dmReceived = useCallback((username: string, message: string) => {
    notify(`${username} just sent you a direct message`, { icon, body: getText(message) });
  }, [notify])

  return {
    isPermissionGranted,
    permissionIgnored,
    dmReceived,
    setPermissionIgnored,
    setIsPermissionGranted,
    notifyMentioned,
    messagePinned,
    messageReplied,
    close,
    request,
  };
};

export default useNotification;