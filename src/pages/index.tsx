import { NextPage } from 'next';
import { useCallback, useEffect } from 'react';
import Cookies from 'js-cookie';

import { DefaultLayout } from 'src/layouts';
import { ChannelChat } from 'src/components/common';
import { useNetworkClient } from '@contexts/network-client-context';

import { useUI } from '@contexts/ui-context';
import usePrevious from 'src/hooks/usePrevious';

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

  const { currentChannel, messages } = useNetworkClient();
  const previousChannelId = usePrevious(currentChannel?.id);

  useEffect(() => {
    if (previousChannelId !== currentChannel?.id) {
      closeModal();
    }
  }, [currentChannel?.id, previousChannelId, closeModal]);

  return <ChannelChat messages={messages} />;
};

export default Home;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Home as any).Layout = DefaultLayout;
