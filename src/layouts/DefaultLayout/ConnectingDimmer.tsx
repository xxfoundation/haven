import { Spinner } from '@components/common';
import { NetworkStatus, useNetworkClient } from '@contexts/network-client-context';
import React from 'react';

import s from './ConnectingDimmer.module.scss';

const ConnectingDimmer = () => {
  const { networkStatus } = useNetworkClient();

  return networkStatus === NetworkStatus.CONNECTING ? <div className={s.dimmer}>
    <Spinner size='md' />
    <p>
      Connecting to the network...
    </p>
  </div> : null;
}

export default ConnectingDimmer;