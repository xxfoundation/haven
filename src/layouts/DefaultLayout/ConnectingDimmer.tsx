import { Spinner } from '@components/common';
import { NetworkStatus, useNetworkClient } from '@contexts/network-client-context';
import React from 'react';

const ConnectingDimmer = () => {
  const { networkStatus } = useNetworkClient();

  return networkStatus === NetworkStatus.CONNECTING ? (
    <div className="fixed w-full h-full bg-black/50 flex flex-col justify-center items-center z-20">
      <Spinner size='md' />
      <p>Connecting to the network...</p>
    </div>
  ) : null;
};

export default ConnectingDimmer;
