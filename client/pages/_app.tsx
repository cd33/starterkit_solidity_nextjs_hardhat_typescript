import "../styles/globals.css";
import type { AppProps } from "next/app";
import { EthersProvider } from "../context/ethersProviderContext";
import Layout from "../components/Layout";
import "react-toastify/dist/ReactToastify.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <EthersProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </EthersProvider>
  );
}

export default MyApp;
