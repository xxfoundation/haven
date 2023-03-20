import { NextPage } from 'next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import cn from 'classnames';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';

import { useNetworkClient } from 'src/contexts/network-client-context';
import { ChannelJSON, PrivacyLevel, useUtils } from 'src/contexts/utils-context';
import { WarningComponent } from 'src/pages/_app';
import JoinChannelView from 'src/components/views/JoinChannel';
import { ModalCtaButton } from 'src/components/common';
import { Spinner } from 'src/components/common';
import { decoder } from 'src/utils';

import s from './join.module.scss';
import CheckboxToggle from '@components/common/CheckboxToggle';

const Join: NextPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [withLink, setWithLink] = useState(false);
  const { getShareUrlType } = useNetworkClient();
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [channelType, setChannelType] = useState<null | PrivacyLevel>(null);
  const { utils, utilsLoaded } = useUtils();
  const [channelInfoJson, setChannelInfoJson] = useState<ChannelJSON>();
  const [channelPrettyPrint, setChannelPrettyPrint] = useState('');
  const broadcastChannel = useMemo<BroadcastChannel>(() => new BroadcastChannel('join_channel'), []);
  const [isLoading, setIsLoading] = useState(true);
  const [dmsEnabled, setDmsEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (Cookies.get('userAuthenticated')) {
      setIsUserAuthenticated(true);
    }
    if (window.location.search.length) {
      setWithLink(true);
    }
  }, []);

  useEffect(() => {
    if (utilsLoaded && isLoading) {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  }, [isLoading, utilsLoaded]);

  useEffect(() => {
    if (channelType === 0 || channelType === 2) {
      if (!isUserAuthenticated) {
        router.replace(`/${window.location.search}`);
      }
    }
  }, [channelType, isUserAuthenticated, router]);

  useEffect(() => {
    if (withLink) {
      const urlType = getShareUrlType(window.location.href);
      setChannelType(urlType);
    }
  }, [isUserAuthenticated, withLink, getShareUrlType]);

  useEffect(() => {
    if (channelType === PrivacyLevel.Public && broadcastChannel) {
      const prettyPrinted = utils.DecodePublicURL(window.location.href);
      const infoJson = JSON.parse(
        decoder.decode(utils.GetChannelJSON(prettyPrinted))
      ) as ChannelJSON;
      setChannelPrettyPrint(prettyPrinted);
      setChannelInfoJson(infoJson);
    }
  }, [broadcastChannel, channelType, utils]);

  const onConfirm = useCallback(() => {
    if (password) {
      try {
        const prettyPrinted = utils.DecodePrivateURL(
          window.location.href,
          password
        );
        const infoJson = JSON.parse(
          decoder.decode(utils.GetChannelJSON(prettyPrinted))
        );
        setChannelPrettyPrint(prettyPrinted);
        setChannelInfoJson(infoJson);
      } catch (e) {
        setError('Invalid passphrase');
      }
    }
  }, [password, utils]);

  if (isLoading) {
    return (
      <div className={'w-full h-screen flex justify-center items-center'}>
        <Spinner />
      </div>
    );
  }

  if (withLink && typeof channelType !== 'number') {
    return (
      <WarningComponent>
        {t('This invite link is invalid.')}
        <br />
        {t('Return to your Speakeasy home tab to continue.')}
      </WarningComponent>
    );
  }

  return withLink ? (
    isUserAuthenticated ? (
      // Public channel
      <>
        {channelInfoJson && window?.location?.href && (
          <JoinChannelView
            dmsEnabled={dmsEnabled}
            onDmsEnabledChange={setDmsEnabled}
            channelInfo={channelInfoJson}
            url={window.location.href}
            onConfirm={() => {
              if (channelPrettyPrint && broadcastChannel) {
                broadcastChannel.postMessage({
                  prettyPrint: channelPrettyPrint,
                  dmsEnabled
                });
              }
            }}
          />
        )}
        {!channelInfoJson && window?.location?.href && channelType === 2 && (
          <div className={s.passwordWrapper}>
            <h2 className='mt-9 mb-6'>
              {('This Speakeasy requires a passphrase to join')}
            </h2>
            <input
              className='mt-3 mb-4'
              name=''
              type='password'
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onConfirm();
                }
              }}
              placeholder={t('Enter passphrase')}
              value={password}
              onChange={e => {
                setPassword(e.target.value);
              }}
            />

            <div className='flex justify-between mt-8 w-full px-3'>
              <h3 className='headline--sm'>
                {t('Enable Direct Messages')}
              </h3>
              <CheckboxToggle checked={dmsEnabled} onChange={() => setDmsEnabled((e) => !e)} />
            </div>
            {error && (
              <div
                className={'text text--xs mt-2 text-center'}
                style={{ color: 'var(--red)' }}
              >
                {error}
              </div>
            )}
            <ModalCtaButton
              buttonCopy={t('Confirm')}
              cssClass={cn('mb-7 mt-8 mr-4', s.button)}
              onClick={onConfirm}
            />
          </div>
        )}
      </>
    ) : (
      <WarningComponent>
        {t('Cannot join a speakeasy, when the user is not logged in.')}
        {t('Return to the signup page to create an identity or log in.')}
      </WarningComponent>
    )
  ) : (
    <WarningComponent>
      {t('Speakeasy can only run with one tab/window at a time.')}
      <br />
      {t('Return to your Speakeasy home tab to continue.')}
    </WarningComponent>
  );
};

export default Join;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Join as any).skipDuplicateTabCheck = true;
