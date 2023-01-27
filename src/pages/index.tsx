import { NextPage } from 'next';
import { useCallback, useEffect } from 'react';
import Cookies from 'js-cookie';

import { DefaultLayout } from 'src/layouts';
import { ChannelChat, Loading } from 'src/components/common';

import { useUI } from '@contexts/ui-context';
import usePrevious from 'src/hooks/usePrevious';
import { useAppSelector } from 'src/store/hooks';
import * as channels from 'src/store/channels';
import * as messages from 'src/store/messages';

const Home: NextPage = () => {
  const { closeModal } = useUI();
  const removeAuthCookie = useCallback(() => {
    Cookies.remove('userAuthenticated', { path: '/' });
  }, []);

  useEffect(() => {
    window.addEventListener('beforeunload', removeAuthCookie);
    window.addEventListener('unload', removeAuthCookie);

    return () => {
      window.removeEventListener('beforeunload', removeAuthCookie);
      window.removeEventListener('unload', removeAuthCookie);
    };
  }, [removeAuthCookie]);

  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const currentChannelMessages = useAppSelector(messages.selectors.currentChannelMessages);
  const previousChannelId = usePrevious(currentChannel?.id);

  useEffect(() => {
    if (previousChannelId !== currentChannel?.id) {
      closeModal();
    }
  }, [currentChannel?.id, previousChannelId, closeModal]);

  return !currentChannelMessages
    ? <Loading />
    : <ChannelChat messages={currentChannelMessages} />;
};

export default Home;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Home as any).Layout = DefaultLayout;
