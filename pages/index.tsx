import { NextPage } from "next";
import { useEffect } from "react";

import { DefaultLayout } from "@layouts";
import { ChannelChat } from "@components/common";
import Cookies from "js-cookie";

const Home: NextPage = () => {
  const removeAuthCookie = () => {
    Cookies.remove("userAuthenticated", { path: "/" });
  };

  useEffect(() => {
    window.addEventListener("beforeunload", removeAuthCookie);
    window.addEventListener("unload", removeAuthCookie);

    () => {
      window.removeEventListener("beforeunload", removeAuthCookie);
      window.removeEventListener("unload", removeAuthCookie);
    };
  }, []);
  return <ChannelChat />;
};

export default Home;
(Home as any).Layout = DefaultLayout;
