import { NextPage } from 'next';
import { useCallback, useEffect, useState } from 'react';
import Cookies from 'js-cookie';

import { DefaultLayout } from 'src/layouts';
import { ChannelChat, Spinner } from 'src/components/common';
import { useNetworkClient } from '@contexts/network-client-context';
import { Message } from '@types';
import { useUI } from '@contexts/ui-context';
import usePrevious from 'src/hooks/usePrevious';

const Home: NextPage = () => {
  const { setShowPinned, showPinned } = useUI();
  const [loading, setLoading] = useState(false);
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

  const { currentChannel, fetchPinnedMessages, mapDbMessagesToMessages, messages } = useNetworkClient();
  const previousChannelId = usePrevious(currentChannel?.id);
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (previousChannelId !== currentChannel?.id) {
      setShowPinned(false);
    }
  }, [currentChannel?.id, previousChannelId, setShowPinned]);

  useEffect(() => {
    if (currentChannel) {
      setLoading(true);
      fetchPinnedMessages()
        .then(setPinnedMessages)
        .finally(() => setLoading(false))
    }
  }, [currentChannel, fetchPinnedMessages, mapDbMessagesToMessages, showPinned]);

  if (loading) {
    return <Spinner />
  }

  return <ChannelChat messages={showPinned ? pinnedMessages : messages} />;
};

export default Home;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Home as any).Layout = DefaultLayout;
