import { FC, useEffect, useState } from "react";
import "@assets/scss/main.scss";
import { AppProps } from "next/app";
import { ManagedUIContext } from "contexts/ui-context";
import { ManagedNetworkContext } from "contexts/network-client-context";
import { ManagedAuthenticationContext } from "contexts/authentication-context";
import { ManagedUtilsContext } from "contexts/utils-context";
import ErrorBoundary from "components/common/ErrorBoundary";
import Head from "next/head";
import { useRouter } from "next/router";
import { isDuplicatedWindow } from "utils/oneTabEnforcer";

let regexp = /android|iphone|kindle|ipad|Harmony|harmony|Tizen|tizen/i;
const isDesktop = () => {
  let details = navigator.userAgent;
  return !regexp.test(details);
};

const Noop: FC<any> = ({ children }) => <>{children}</>;

function MyApp({ Component, pageProps }: AppProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    setShouldRender(true);
  }, []);
  const router = useRouter();

  useEffect(() => {
    if (!isDesktop()) {
      router.push("https://www.speakeasy.tech/open-source/");
    }
  }, []);

  const Layout = (Component as any).Layout || Noop;

  if (shouldRender) {
    if (isDuplicatedWindow(15000, 10000, "MyApp")) {
      return <WarningComponent />;
    } else {
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
  } else {
    return null;
  }
}

const WarningComponent = () => (
  <>
    <Head>
      <title>internet speakeasy</title>
      <link rel="icon" href="/favicon.svg" />
    </Head>
    <div className="h-screen w-full flex justify-center items-center px-20">
      <h1
        className="headline m-auto text-center"
        style={{
          fontSize: "48px",
          color: "var(--cyan)"
        }}
      >
        Speakeasy app can only run with one tab/window at a time
      </h1>
    </div>
  </>
);

export default MyApp;
