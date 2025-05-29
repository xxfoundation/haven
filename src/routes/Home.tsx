import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { DefaultLayout } from '../layouts';
import { ChannelChat } from '../components/common';
import { useUI } from '@contexts/ui-context';
import usePrevious from '../hooks/usePrevious';
import { useAppSelector } from '../store/hooks';
import * as channels from '../store/channels';
import { currentMessages as currentMessagesSelector } from '../store/selectors';

const removeAuthCookie = () => {
  Cookies.remove('userAuthenticated', { path: '/' });
};

const Home = () => {
  const { closeModal } = useUI();

  useEffect(() => {
    window.addEventListener('beforeunload', removeAuthCookie);
    window.addEventListener('unload', removeAuthCookie);

    return () => {
      window.removeEventListener('beforeunload', removeAuthCookie);
      window.removeEventListener('unload', removeAuthCookie);
    };
  }, []);

  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const previousChannelId = usePrevious(currentChannel?.id);
  const currentMessages = useAppSelector(currentMessagesSelector);

  useEffect(() => {
    if (previousChannelId !== currentChannel?.id) {
      closeModal();
    }
  }, [currentChannel?.id, previousChannelId, closeModal]);

  return <ChannelChat messages={currentMessages} />;
};

// Wrap with layout
const HomeWithLayout = () => (
  <DefaultLayout>
    <Home />
  </DefaultLayout>
);

export default HomeWithLayout;
