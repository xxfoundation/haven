import { FC } from "react";
import "@assets/scss/main.scss";
import { AppProps } from "next/app";
import { ManagedUIContext } from "contexts/ui-context";
import { ManagedNetworkContext } from "contexts/network-client-context";
import { ManagedAuthenticationContext } from "contexts/authentication-context";
import { ManagedUtilsContext } from "contexts/utils-context";

const Noop: FC<any> = ({ children }) => <>{children}</>;

function MyApp({ Component, pageProps }: AppProps) {
  const Layout = (Component as any).Layout || Noop;
  return (
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
  );
}

export default MyApp;
