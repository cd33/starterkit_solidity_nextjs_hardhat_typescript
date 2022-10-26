import { useCallback, useState } from "react";
import useEthersProvider from "../context/useEthersProvider";
import { ethers, providers } from "ethers";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import { Blocks } from "react-loader-spinner";

declare var window: any;

export type Network = {
  name: string;
  chainId: number;
  ensAddress?: string;
  _defaultProvider?: (providers: any, options?: any) => any;
};

export default function Header() {
  const { account, setAccount, provider, setProvider } = useEthersProvider();
  const [isLoading, setIsLoading] = useState(false);

  const connectWallet = useCallback(async () => {
    if (
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined" &&
      provider
    ) {
      setIsLoading(true);
      let network: Network | null;
      network = await provider.getNetwork();
      if (network !== null) {
        if (network.chainId === 5) {
          try {
            const resultAccount = await provider.send(
              "eth_requestAccounts",
              []
            );
            setAccount(ethers.utils.getAddress(resultAccount[0]));
            setIsLoading(false);
            console.log("Wallet connected");
            toast.success("Wallet connected successfully");
          } catch (err) {
            setAccount(null);
            setIsLoading(false);
            console.log("Please select Ethereum Main Network on Metamask");
            toast.error("Please select Ethereum Main Network on Metamask");
          }
        } else {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x5" }], // à changer en 0x1 si Mainnet
            });
            const resultAccount = await provider.send(
              "eth_requestAccounts",
              []
            );
            setAccount(ethers.utils.getAddress(resultAccount[0]));
            setIsLoading(false);
            console.log("Wallet connected");
            toast.success("Wallet connected successfully");
          } catch {
            setAccount(null);
            setIsLoading(false);
            console.log("Please select Ethereum Main Network on Metamask");
            toast.error("Please select Ethereum Main Network on Metamask");
          }
        }
      } else {
        setAccount(null);
        setIsLoading(false);
        console.log(
          "Wallet error: check the correct functioning of your wallet"
        );
        toast.error(
          "Wallet error: check the correct functioning of your wallet"
        );
      }
    }
  }, [provider, setAccount]);

  // useEffect(() => {
  //   !account && connectWallet();
  // }, [account, connectWallet]);

  const logout = () => {
    setAccount();
    setProvider(new providers.Web3Provider(window.ethereum));
    toast.success("Logged out successfully");
  };

  return (
    <div className="header">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover={false}
        theme="dark"
      />
      <div className="navbar">
        <div>
          <Link href="/">
            <a>Home</a>
          </Link>
          <Link href="/mint">
            <a>Mint</a>
          </Link>
        </div>
        <div>
          {isLoading ? (
            <Blocks
              visible={true}
              height="30"
              width="30"
              ariaLabel="blocks-loading"
              wrapperStyle={{}}
              wrapperClass="blocks-wrapper"
            />
          ) : account ? (
            <>
              <span
                style={{ color: "orange", fontWeight: "bold", marginRight: 10 }}
              >
                {account.substring(0, 5)}...
                {account.substring(account.length - 4)}
              </span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <button onClick={() => connectWallet()}>Connect</button>
          )}
        </div>
      </div>
    </div>
  );
}
