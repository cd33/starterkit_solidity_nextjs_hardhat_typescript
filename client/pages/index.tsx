import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import useEthersProvider from "../context/useEthersProvider";

const Home: NextPage = () => {
  const {
    account,
    provider,
    owner,
    recipient
  } = useEthersProvider();
  const [toto, setToto] = useState<string>("Starter Kit");
  const [isToto, setIsToto] = useState<boolean>(true);

  return (
    <div className="home">
      <Head>
        <title>{isToto && toto}</title>
        <meta name="Carlito" content="Carlito starter kit" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <p>Provider: {provider && provider._network && provider._network.name}</p>
      <p>Wallet connected: {account}</p>
      <p>{owner}</p>
      <p>{recipient}</p>
    </div>
  );
};

export default Home;
