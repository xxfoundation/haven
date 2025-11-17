import CheckboxToggle from '@components/common/CheckboxToggle';
import NotificationSoundSelector from '@components/common/NotificationSoundSelector';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useNotification from 'src/hooks/useNotification';
import { useUI } from '@contexts/ui-context';

const NotificationsView = () => {
  const { t } = useTranslation();
  const { setRightSidebarView } = useUI();
  const {
    isPermissionGranted,
    setIsPermissionGranted,
    enableSounds,
    setEnableSounds,
    notifyOnDMs,
    setNotifyOnDMs,
    notifyOnMentions,
    setNotifyOnMentions,
    notifyOnReplies,
    setNotifyOnReplies,
    notifyOnPins,
    setNotifyOnPins
  } = useNotification();
  const [showDeniedWarning, setShowDeniedWarning] = useState(false);

  const onNotificationsChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        // Request permission
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setIsPermissionGranted(true);
          setShowDeniedWarning(false);
        } else {
          // Permission denied or default (user dismissed)
          setIsPermissionGranted(false);
          setShowDeniedWarning(true);
        }
      } else {
        // User disabling notifications
        setIsPermissionGranted(false);
        setShowDeniedWarning(false);
      }
    },
    [setIsPermissionGranted]
  );

  return (
    <>
      <h2>{t('Notifications')}</h2>
      <hr className='w-full my-10 border-charcoal-3' />
      <div className='space-y-6'>
        {/* Browser Notifications Section */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>{t('Browser Notifications')}</h3>
          <div className='flex justify-between items-center'>
            <div>
              <p className='font-medium'>{t('Enable Browser Notifications')}</p>
              <p className='text-sm text-charcoal-1'>{t('Show desktop notifications for events')}</p>
            </div>
            <CheckboxToggle checked={isPermissionGranted} onChange={onNotificationsChange} />
          </div>
          {showDeniedWarning && (
            <p className='text-sm text-red-400'>
              {t('Notifications disabled in browser settings. Enable in browser to continue.')}
            </p>
          )}
        </div>

        <hr className='w-full border-charcoal-3' />

        {/* Sound Notifications Section */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>{t('Sound Notifications')}</h3>
          <div className='flex justify-between items-center'>
            <div>
              <p className='font-medium'>{t('Enable Notification Sounds')}</p>
              <p className='text-sm text-charcoal-1'>{t('Play a sound when notifications occur')}</p>
            </div>
            <CheckboxToggle checked={enableSounds} onChange={(e) => setEnableSounds(e.target.checked)} />
          </div>
          {enableSounds && (
            <div className='flex justify-between items-center'>
              <p className='font-medium'>{t('Notification Sound')}</p>
              <NotificationSoundSelector />
            </div>
          )}
        </div>

        <hr className='w-full border-charcoal-3' />

        {/* Notification Types Section */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>{t('Notification Types')}</h3>
          <p className='text-sm text-charcoal-1'>{t('Choose which events trigger notifications')}</p>
          
          <div className='flex justify-between items-center'>
            <div>
              <p className='font-medium'>{t('Direct Messages')}</p>
              <p className='text-sm text-charcoal-1'>{t('When someone sends you a private message')}</p>
            </div>
            <CheckboxToggle checked={notifyOnDMs} onChange={(e) => setNotifyOnDMs(e.target.checked)} />
          </div>

          <div className='flex justify-between items-center'>
            <div>
              <p className='font-medium'>{t('@Mentions')}</p>
              <p className='text-sm text-charcoal-1'>{t('When someone mentions you in a channel')}</p>
            </div>
            <CheckboxToggle checked={notifyOnMentions} onChange={(e) => setNotifyOnMentions(e.target.checked)} />
          </div>

          <div className='flex justify-between items-center'>
            <div>
              <p className='font-medium'>{t('Replies')}</p>
              <p className='text-sm text-charcoal-1'>{t('When someone replies to your message')}</p>
            </div>
            <CheckboxToggle checked={notifyOnReplies} onChange={(e) => setNotifyOnReplies(e.target.checked)} />
          </div>

          <div className='flex justify-between items-center'>
            <div>
              <p className='font-medium'>{t('Pinned Messages')}</p>
              <p className='text-sm text-charcoal-1'>{t('When an admin pins an important message')}</p>
            </div>
            <CheckboxToggle checked={notifyOnPins} onChange={(e) => setNotifyOnPins(e.target.checked)} />
          </div>
        </div>

        <hr className='w-full border-charcoal-3' />

        {/* Per-Channel Settings Section */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>{t('Per-Channel Settings')}</h3>
          <p className='text-sm text-charcoal-1'>
            {t('Fine-tune notification preferences for individual channels. Click the channel menu in any channel and select "Notifications" to customize.')}
          </p>
          <p className='text-xs text-charcoal-1 italic'>
            {t('Note: Per-channel settings can override the notification types above. If a channel is muted, no notifications will be shown for that channel.')}
          </p>
        </div>
      </div>
    </>
  );
};

export default NotificationsView;
