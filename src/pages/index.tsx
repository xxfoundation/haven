import { NextPage } from 'next';
import { useCallback, useEffect } from 'react';
import Cookies from 'js-cookie';

import { DefaultLayout } from 'src/layouts';
import { ChannelChat } from 'src/components/common';

const Home: NextPage = () => {
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
  return <ChannelChat />;
};

export default Home;
(Home as any).Layout = DefaultLayout;
