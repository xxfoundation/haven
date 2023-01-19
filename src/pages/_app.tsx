import type { WithChildren } from 'src/types';
import React, { FC, useEffect, useState } from 'react';

import { NextSeo } from 'next-seo';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { ManagedUIContext } from 'src/contexts/ui-context';
import { ManagedNetworkContext } from 'src/contexts/network-client-context';
import { ManagedAuthenticationContext } from 'src/contexts/authentication-context';
import { ManagedUtilsContext } from 'src/contexts/utils-context';
import { isDuplicatedWindow } from 'src/utils/oneTabEnforcer';
import { WebAssemblyRunner } from 'src/components/common';

import 'src/assets/scss/main.scss';
import ErrorBoundary from 'src/components/common/ErrorBoundary';
import { DBProvider } from '@contexts/db-context';

const regexp = /android|iphone|iPhone|kindle|ipad|iPad|Harmony|harmony|Tizen|tizen/i;
const isDesktop = () => {
  const details = navigator.userAgent;
  return !regexp.test(details);
};

const Noop: FC<WithChildren> = ({ children }) => <>{children}</>;

export const WarningComponent: FC<WithChildren> = ({ children }) => (
  <>
    <Head>
      <title>internet speakeasy</title>
      <link rel='icon' href='/favicon.svg' />
    </Head>
    <div className='h-screen w-full flex justify-center items-center px-20'>
      <h1
        className='headline m-auto text-center'
        style={{
          fontSize: '48px',
          color: 'var(--cyan)',
          lineHeight: '1.2'
        }}
      >
        {children}
      </h1>
    </div>
  </>
);


const SEO = () => {
  const [url, setUrl] = useState('');
  const [origin, setOrigin] = useState('');
  useEffect(() => {
    setUrl(`${window.location.origin}${window.location.pathname}`);
    setOrigin(window.location.origin);
  }, []);
  return (
    <NextSeo
      openGraph={{
        type: 'website',
        url: url,
        title: 'Speakeasy',
        description: '',
        images: [
          {
            url: `${origin}/preview.jpeg`,
            width: 1280,
            height: 720,
            alt: 'Speakeasy'
          }
        ]
      }}
    />
  );
};

const SpeakeasyApp = ({ Component, pageProps }: AppProps) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    setShouldRender(true);
  }, []);
  const router = useRouter();

  useEffect(() => {
    if (!isDesktop()) {
      router.push('https://www.speakeasy.tech/mobile/');
    }
  }, [router]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Layout = (Component as any).Layout || Noop;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const skipDuplicateTabCheck = (Component as any).skipDuplicateTabCheck;

  if (shouldRender) {
    return (
      <ErrorBoundary>
        <Head>
          <title>internet speakeasy</title>
          <link rel='icon' href='/favicon.svg' />
        </Head>
        <SEO />
        <DBProvider>
          <ManagedUtilsContext>
            <ManagedAuthenticationContext>
              <ManagedNetworkContext>
                <ManagedUIContext>
                  <WebAssemblyRunner>
                    {!skipDuplicateTabCheck &&
                    isDuplicatedWindow(15000, 10000, 'MyApp') ? (
                      <WarningComponent>
                        Speakeasy can only run with one tab/window at a time.<br />
                        Return to your Speakeasy home tab to continue.
                      </WarningComponent>
                    ) : (
                      <Layout pageProps={{ ...pageProps }}>
                        <Component {...pageProps} />
                      </Layout>
                    )}
                  </WebAssemblyRunner>
                </ManagedUIContext>
              </ManagedNetworkContext>
            </ManagedAuthenticationContext>
          </ManagedUtilsContext>
        </DBProvider>
      </ErrorBoundary>
    );
  } else {
    return null;
  }
}

export default SpeakeasyApp;
