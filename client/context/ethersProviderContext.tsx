import { useEffect, useState, createContext } from "react";
import { providers } from "ethers";
import { ReactElement } from "react";

type Context = {
  account: string | null;
  provider: providers.Web3Provider | null;
  setAccount: Function;
  setProvider: Function;
  owner: string;
  recipient: string;
  contract721Address: string;
};

const initialContext: Context = {
  account: null,
  provider: null,
  setAccount: (): void => {
    throw new Error("setAccount function must be overridden");
  },
  setProvider: (): void => {
    throw new Error("setProvider not implemented");
  },
  owner: "",
  recipient: "",
  contract721Address: "",
};

declare var window: any;

const EthersContext = createContext(initialContext);

export const EthersProvider = (props: { children: ReactElement }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<providers.Web3Provider | null>(null);
  const owner = "WALLET OWNER";
  const recipient = "WALLET RECIPIENT";
  const contract721Address = "ADDRESS CONTRACT"
  // const contract721Address = "0xe7d3c30D2c0c567fd2ADa0487aAff068880Df041"

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined"
    ) {
      window.ethereum.on("accountsChanged", () => {
        setAccount(null);
        setProvider(new providers.Web3Provider(window.ethereum));
        // window.ethereum.removeAllListeners('accountsChanged')
      });
      // window.ethereum.on("chainChanged", () => {
      //   setAccount(null);
      //   setProvider(new providers.Web3Provider(window.ethereum));
      // });
      window.ethereum.on("disconnect", () => {
        setAccount(null);
        setProvider(new providers.Web3Provider(window.ethereum));
      });
    }
  }, []);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined"
    ) {
      setProvider(new providers.Web3Provider(window.ethereum));
    }
  }, []);

  return (
    <EthersContext.Provider
      value={{
        account,
        provider,
        setAccount,
        setProvider,
        owner,
        recipient,
        contract721Address
      }}
    >
      {props.children}
    </EthersContext.Provider>
  );
};

export default EthersContext;