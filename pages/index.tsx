import { NextPage } from "next";

import { DefaultLayout } from "@layouts";
import { ChannelChat } from "@components/common";

const Home: NextPage = () => {
  return <ChannelChat />;
};

export default Home;
(Home as any).Layout = DefaultLayout;
