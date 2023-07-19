import { FC, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { PrivacyLevel } from 'src/types';
import { Button } from 'src/components/common';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { useUI } from 'src/contexts/ui-context';
import { useUtils } from 'src/contexts/utils-context';
import CheckboxToggle from 'src/components/common/CheckboxToggle';
import { useRouter } from 'next/router';
import Input from 'src/components/common/Input';
import ErrorIcon from 'src/components/icons/Error';
import ModalTitle from '../ModalTitle';

const JoinChannelView: FC = () => {
  const { t } = useTranslation();
  const { channelInviteLink, closeModal, setChannelInviteLink } = useUI();

  const [url, setUrl] = useState<string>(channelInviteLink || '');
  const { getShareUrlType, joinChannel } = useNetworkClient();
  const router = useRouter();
  const { utils } = useUtils();
  const [error, setError] = useState('');
  const [needPassword, setNeedPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [dmsEnabled, setDmsEnabled] = useState<boolean>(true);

  useEffect(() => {
    return () => {
      if (channelInviteLink?.length) {
        setChannelInviteLink('');
        router.replace('/', undefined, { shallow: true });
      }
    };
  }, [channelInviteLink?.length, router, setChannelInviteLink]);

  useEffect(() => {
    setError('');
  }, [password, dmsEnabled, url])

  const handleSubmit = useCallback(async () => {
    if (url.length === 0) {
      return;
    }

    if (!needPassword) {
      const res = getShareUrlType(url);

      if (res === PrivacyLevel.Public) {
        try {
          const prettyPrint = utils.DecodePublicURL(url);
          joinChannel(prettyPrint, true, !!dmsEnabled);
          setUrl('');
          closeModal();
        } catch (e) {
          console.error((e as Error).message);
          setError(t('Something wrong happened, please check your details.'));
        }
      } else if (res === PrivacyLevel.Secret) {
        // Secret then needs to capture password
        setNeedPassword(true);
        return;
      } else {
        setError(t('Unexpected channel type.'));
      }
    } else {
      if (url && password) {
        try {
          const prettyPrint = utils.DecodePrivateURL(url, password);
          joinChannel(prettyPrint);
          setUrl('');
          setPassword('');
          closeModal();
        } catch (e) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          console.error((e as Error).message);
          setError(t('Something wrong happened, please check your details.'));
        }
      }
    }
  }, [closeModal, dmsEnabled, getShareUrlType, joinChannel, needPassword, password, t, url, utils]);

  return (
    <>
      <ModalTitle>
        {t('Join a Space')}
      </ModalTitle>
      <Input
        name=''
        placeholder={t('Enter invite link')}
        value={url}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSubmit();
          }
        }}
        onChange={e => {
          setUrl(e.target.value);
        }}
      />
      {needPassword && (
        <Input
          className='mt-3 mb-4'
          name=''
          placeholder={t('Enter passphrase')}
          value={password}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
          onChange={e => {
            setPassword(e.target.value);
          }}
        />
      )}
      <div className='flex justify-between mt-8 w-full px-3'>
        <h3 className='headline--sm'>
          {t('Enable direct messages')}
        </h3>
        <CheckboxToggle checked={dmsEnabled} onChange={() => setDmsEnabled((e) => !e)} />
      </div>
      {error && (
        <div className='flex w-full space-x-2 p-3 rounded-2xl border border-red bg-red-200' style={{ background: 'rgba(227, 48, 75, 0.15)'}}>
          <ErrorIcon />
          <span>{error}</span>
        </div>
      )}
      <Button
        className='w-full'
        onClick={handleSubmit}
      >
        {t('Continue')}
      </Button>
    </>
  );
};

export default JoinChannelView;
