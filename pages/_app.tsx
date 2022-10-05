import { FC } from "react";
import "@assets/scss/main.scss";
import { AppProps } from "next/app";
import { ManagedUIContext } from "contexts/ui-context";
import { ManagedNetworkContext } from "contexts/network-client-context";
import { ManagedAuthenticationContext } from "contexts/authentication-context";
import { ManagedUtilsContext } from "contexts/utils-context";
import ErrorBoundary from "components/common/ErrorBoundary";
import Head from "next/head";

const Noop: FC<any> = ({ children }) => <>{children}</>;

function MyApp({ Component, pageProps }: AppProps) {
  const Layout = (Component as any).Layout || Noop;
  return (
    <ErrorBoundary>
      <Head>
        <title>internet speakeasy</title>
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <ManagedUtilsContext>
        <ManagedAuthenticationContext>
          <ManagedNetworkContext>
            <ManagedUIContext>
              <Layout pageProps={{ ...pageProps }}>
                <Component {...pageProps} />
              </Layout>
            </ManagedUIContext>
          </ManagedNetworkContext>
        </ManagedAuthenticationContext>
      </ManagedUtilsContext>
    </ErrorBoundary>
  );
}

export default MyApp;
