import { FC, useState, useEffect } from 'react';
import s from './JoinChannelView.module.scss';
import cn from 'classnames';
import { ModalCtaButton } from 'src/components/common';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { useUI } from 'src/contexts/ui-context';
import { useUtils } from 'src/contexts/utils-context';

const JoinChannelView: FC = ({}) => {
  const { channelInviteLink, closeModal, setChannelInviteLink } = useUI();

  const [url, setUrl] = useState<string>(channelInviteLink || '');
  const { getShareUrlType, joinChannel } = useNetworkClient();
  const { utils } = useUtils();
  const [error, setError] = useState('');
  const [needPassword, setNeedPassword] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    // TODO look into this
    return () => {
      if (channelInviteLink?.length) {
        setChannelInviteLink('');
      }
    };
  }, [channelInviteLink?.length, setChannelInviteLink]);

  const handleSubmit = async () => {
    if (url.length === 0) {
      return;
    }

    if (!needPassword) {
      const res = getShareUrlType(url);

      if (res === 0) {
        // Public then we should proceed

        try {
          const prettyPrint = utils.DecodePublicURL(url);
          joinChannel(prettyPrint);
          setUrl('');
          closeModal();
        } catch (e) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          console.error((e as any).message);
          setError('Something wrong happened, please check your details.');
        }
      } else if (res === 2) {
        // Secret then needs to capture password
        setNeedPassword(true);
        return;
      } else if (res === 1) {
        // ToDO: Private channel
      } else {
        setError('Something wrong happened, please check your details.');
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
          console.error((e as any).message);
          setError('Something wrong happened, please check your details.');
        }
      }
    }
  };

  return (
    <div
      className={cn('w-full flex flex-col justify-center items-center', s.root)}
    >
      <h2 className='mt-9 mb-4'>Join a Speakeasy</h2>
      <input
        name=''
        placeholder='Enter invite link'
        value={url}
        onChange={e => {
          setUrl(e.target.value);
        }}
      ></input>
      {needPassword && (
        <input
          className='mt-3 mb-4'
          name=''
          placeholder='Enter passphrase'
          value={password}
          onChange={e => {
            setPassword(e.target.value);
          }}
        ></input>
      )}

      {error && (
        <div
          className={cn('text text--xs mt-2', s.error)}
          style={{ color: 'var(--red)' }}
        >
          {error}
        </div>
      )}
      <ModalCtaButton
        buttonCopy={needPassword ? 'Join' : 'Go'}
        cssClass={cn('mt-12 mb-10', s.button)}
        onClick={handleSubmit}
      />
    </div>
  );
};

export default JoinChannelView;
