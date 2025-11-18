import { FC, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';

import CloseButton from '../CloseButton';
import { useUI } from '@contexts/ui-context';
import { useAppSelector } from 'src/store/hooks';
import ChannelBadges from '../ChannelBadges';
import Identity from '../Identity';
import Button from '../Button';
import { fullIdentity } from 'src/store/selectors';
import * as channels from 'src/store/channels';

import CheckboxToggle from '../CheckboxToggle';
import { useNetworkClient } from '@contexts/network-client-context';
import Spinner from '../Spinner/Spinner';
import Collapse from '../Collapse';
import { ChannelNotificationLevel, NotificationStatus } from 'src/types';
import { useUtils } from '@contexts/utils-context';
import useNotification from 'src/hooks/useNotification';
import classNames from 'classnames';
import useCopyClipboard from 'src/hooks/useCopyToClipboard';
import Copy from '@components/icons/Copy';
import Checkmark from '@components/icons/Checkmark';
import LockOpen from '@components/icons/LockOpen';
import useDmClient from 'src/hooks/useDmClient';

interface Credentials {
  url: string;
  password: string;
}

const CopyButton: FC<{ copied?: boolean; onClick: () => void }> = ({ copied, onClick }) => {
  const Icon = copied ? Checkmark : Copy;
  return (
    <Button
      onClick={onClick}
      variant='unstyled'
      className={cn(
        'p-2 ml-2 hover:bg-charcoal-3-20 rounded-full hover:text-primary duration-100 transition-all',
        {
          'text-green hover:text-green hover:bg-charcoal-3 bg-charcoal-3': copied
        }
      )}
    >
      <Icon className='w-6 h-6' />
    </Button>
  );
};



const SpaceSettings = () => {
  const { t } = useTranslation();
  const { channelManager, getShareURL } = useNetworkClient();
  const { utils } = useUtils();
  const { isPermissionGranted } = useNotification();
  const { openModal, setModalView, setRightSidebarView } = useUI();
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const dmsEnabled = useAppSelector(channels.selectors.dmsEnabled(currentChannel?.id));
  const identity = useAppSelector(fullIdentity);
  const channelNotificationLevel = useAppSelector(
    channels.selectors.notificationLevel(currentChannel?.id)
  );
  const channelNotificationsEnabled =
    channelNotificationLevel === ChannelNotificationLevel.NotifyPing;
  
  const [credentials, setCredentials] = useState<Credentials>({
    url: '',
    password: ''
  });
  const [urlCopied, copyUrl] = useCopyClipboard(700);
  const [passwordCopied, copyPassword] = useCopyClipboard(700);
  const [inviteCopied, copyInvite] = useCopyClipboard(700);
  const [idCopied, copyId] = useCopyClipboard(700);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [passwordRevealed, setPasswordRevealed] = useState(false);

  const toggleDms = useCallback(() => {
    if (!currentChannel || !channelManager) {
      return;
    }

    const fn = dmsEnabled ? 'DisableDirectMessages' : 'EnableDirectMessages';
    channelManager?.[fn](new Uint8Array(Buffer.from(currentChannel.id, 'base64')));
  }, [channelManager, currentChannel, dmsEnabled]);

  const toggleChannelNotifications = useCallback(() => {
    const newLevel =
      channelNotificationLevel === ChannelNotificationLevel.NotifyPing
        ? ChannelNotificationLevel.NotifyNone
        : ChannelNotificationLevel.NotifyPing;
    const newState =
      newLevel === ChannelNotificationLevel.NotifyPing
        ? NotificationStatus.WhenOpen
        : NotificationStatus.Mute;

    if (currentChannel?.id) {
      channelManager?.SetMobileNotificationsLevel(
        utils.Base64ToUint8Array(currentChannel?.id),
        newLevel,
        newState
      );
    }
  }, [channelManager, channelNotificationLevel, currentChannel?.id, utils]);

  const handleLeaveSpace = useCallback(() => {
    setModalView('LEAVE_CHANNEL_CONFIRMATION');
    openModal();
    setShowLeaveConfirmation(false);
  }, [setModalView, openModal]);

  useEffect(() => {
    if (currentChannel) {
      const resultCredential = getShareURL(currentChannel?.id);

      if (resultCredential) {
        setCredentials({
          url: resultCredential?.url || '',
          password: resultCredential?.password || ''
        });
      }
    }
  }, [currentChannel, getShareURL]);



  return currentChannel && identity ? (
    <div className='p-6 overflow-y-auto h-full'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='font-medium text-lg'>"{currentChannel.name}" Info and Settings</h2>
        <CloseButton className='w-8 h-8' onClick={() => setRightSidebarView(null)} />
      </div>

      {/* SECTION A: SPACE INFO */}
      <div className='space-y-4 mb-6'>
        {currentChannel.description && (
          <div>
            <h6 className='uppercase text-xs text-charcoal-2 mb-1'>{t('Description')}</h6>
            <p className='text-charcoal-1 text-sm'>{currentChannel.description}</p>
          </div>
        )}

        <div>
          <h6 className='uppercase text-xs text-charcoal-2 mb-1'>{t('Space ID')}</h6>
          <div className='flex items-center'>
            <span className='text-charcoal-1 text-xs break-all'>{currentChannel.id}</span>
            <CopyButton
              copied={idCopied}
              onClick={() => copyId(currentChannel.id)}
            />
          </div>
        </div>
      </div>

      {/* SECTION B: USER RELATED */}
      <div className='space-y-5'>
        <div>
          <h6 className='uppercase text-xs text-charcoal-2 mb-2'>{t('Connected as')}</h6>
          <Identity className='font-semibold block truncate text-charcoal-1' {...identity} />
          <Button
            onClick={() => {
              setModalView('SET_NICK_NAME');
              openModal();
            }}
            variant='outlined'
            size='sm'
            className='mt-2'
          >
            {t('Set nickname')}
          </Button>
        </div>

        <div className='flex justify-between items-center'>
          <div>
            <h6 className='uppercase text-xs text-charcoal-2'>{t('Notifications')}</h6>
            {!isPermissionGranted && (
              <p className='text-xs text-orange mt-1'>{t('Enable browser notifications first')}</p>
            )}
          </div>
          {channelNotificationLevel === null ? (
            <Spinner className='m-0 mr-1' />
          ) : (
            <CheckboxToggle
              checked={channelNotificationsEnabled && isPermissionGranted}
              onChange={isPermissionGranted ? toggleChannelNotifications : undefined}
              disabled={!isPermissionGranted}
            />
          )}
        </div>

        <div className='flex justify-between items-center'>
          <h6 className='uppercase text-xs text-charcoal-2'>{t('Direct Messages')}</h6>
          {dmsEnabled === null ? (
            <Spinner className='m-0 mr-1' />
          ) : (
            <CheckboxToggle checked={dmsEnabled} onChange={toggleDms} />
          )}
        </div>

        <div>
          <h6 className='uppercase text-xs text-charcoal-2 mb-2'>{t('Admin Keys')}</h6>
          {currentChannel?.isAdmin ? (
            <Button
              onClick={() => {
                setModalView('EXPORT_ADMIN_KEYS');
                openModal();
              }}
              variant='outlined'
              size='sm'
              className='w-full'
            >
              {t('Export Admin Keys')}
            </Button>
          ) : (
            <Button
              onClick={() => {
                setModalView('CLAIM_ADMIN_KEYS');
                openModal();
              }}
              variant='outlined'
              size='sm'
              className='w-full'
            >
              {t('Claim Admin Keys')}
            </Button>
          )}
        </div>

        {/* Share Space Section */}
        <div>
          <h6 className='uppercase text-xs text-charcoal-2 mb-2'>{t('Share Space')}</h6>

          {credentials.url.length > 0 && (
            <div className='space-y-3'>
              <div className='flex items-center mb-1'>
                <span className='text-xs text-charcoal-1 mr-2'>{t('Invite link')}</span>
                <CopyButton
                  copied={urlCopied}
                  onClick={() => copyUrl(credentials.url)}
                />
              </div>
              <Collapse title="" defaultActive={false}>
                <div className='flex items-center bg-charcoal-4 p-2 rounded'>
                  <span className='text-charcoal-1 text-xs break-all flex-1'>
                    {credentials.url}
                  </span>
                </div>
              </Collapse>

              {credentials.password.length > 0 && (
                <>
                  <div className='flex items-center mb-1'>
                    <span className='text-xs text-charcoal-1 mr-2'>{t('Password')}</span>
                    <CopyButton
                      copied={passwordCopied}
                      onClick={() => copyPassword(credentials.password)}
                    />
                  </div>
                  <div className='flex items-center bg-charcoal-4 p-2 rounded'>
                    <span className='text-charcoal-1 text-xs break-all flex-1'>
                      {passwordRevealed ? credentials.password : '*'.repeat(credentials.password.length)}
                    </span>
                    <Button
                      onClick={() => setPasswordRevealed(!passwordRevealed)}
                      variant='unstyled'
                      className='p-1 ml-2 hover:bg-charcoal-3-20 rounded-full'
                    >
                      <LockOpen className='w-4 h-4' />
                    </Button>
                  </div>
                </>
              )}

              <p className='text-orange text-xs'>
                {t(`Warning: With these credentials anyone can read and send to this Haven, make sure to keep it safe!`)}
              </p>

              <Button
                variant='outlined'
                size='sm'
                className={cn('w-full flex justify-center transition-all', {
                  'border-green text-green': inviteCopied
                })}
                onClick={() => {
                  copyInvite(
                    credentials.password
                      ? t('Invite to join {{name}}: \n{{id}} \n{{url}}\nPassword: {{password}}', {
                        ...credentials,
                        ...currentChannel
                      })
                      : t('Invite to join {{name}}: \n{{id}} \n{{url}}', {
                        ...credentials,
                        ...currentChannel
                      })
                  );
                }}
              >
                {inviteCopied ? t('Copied') : t('Copy Complete Invite')}
              </Button>
            </div>
          )}
        </div>

        {/* Leave Space Section */}
        <div>
          <h6 className='uppercase text-xs text-charcoal-2 mb-2'>{t('Leave Space')}</h6>
          {!showLeaveConfirmation ? (
            <Button
              onClick={() => setShowLeaveConfirmation(true)}
              variant='outlined'
              size='sm'
              className='w-full border-red text-red hover:bg-red hover:text-white'
            >
              {t('Leave Space')}
            </Button>
          ) : (
            <div className='space-y-2'>
              <p className='text-orange text-xs'>
                {t('Are you sure you want to leave this space?')}
              </p>
              <div className='flex space-x-2'>
                <Button
                  onClick={handleLeaveSpace}
                  variant='primary'
                  size='sm'
                  className='flex-1 bg-red hover:bg-red-dark'
                >
                  {t('Confirm')}
                </Button>
                <Button
                  onClick={() => setShowLeaveConfirmation(false)}
                  variant='outlined'
                  size='sm'
                  className='flex-1'
                >
                  {t('Cancel')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  ) : null;
};

export default SpaceSettings;
