import { FC, useEffect } from "react";
// import "../styles/globals.css";
import "@assets/scss/main.scss";
import { AppProps } from "next/app";
import { ManagedUIContext } from "contexts/ui-context";

const Noop: FC<any> = ({ children }) => <>{children}</>;

function MyApp({ Component, pageProps }: AppProps) {
  const Layout = (Component as any).Layout || Noop;
  return (
    <ManagedUIContext>
      <Layout pageProps={{ ...pageProps }}>
        <Component {...pageProps} />
      </Layout>
    </ManagedUIContext>
  );
}

export default MyApp;
