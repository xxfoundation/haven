import { FC } from "react";
import "@assets/scss/main.scss";
import { AppProps } from "next/app";
import { ManagedUIContext } from "contexts/ui-context";
import { ManagedNetworkContext } from "contexts/network-client-context";

const Noop: FC<any> = ({ children }) => <>{children}</>;

function MyApp({ Component, pageProps }: AppProps) {
  const Layout = (Component as any).Layout || Noop;
  return (
    <ManagedNetworkContext>
      <ManagedUIContext>
        <Layout pageProps={{ ...pageProps }}>
          <Component {...pageProps} />
        </Layout>
      </ManagedUIContext>
    </ManagedNetworkContext>
  );
}

export default MyApp;
