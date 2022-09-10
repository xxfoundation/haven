import { NextPage } from "next";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { DefaultLayout } from "@layouts";
import { ChannelChat } from "@components/common";

const Home: NextPage = () => {
  return <ChannelChat />;
};

export default Home;
Home.Layout = DefaultLayout;
