import { useCallback, useState } from "react";
import useEthersProvider from "../context/useEthersProvider";
import { ethers, providers } from "ethers";
import { toast } from "react-toastify";

declare var window: any;

export type Network = {
  name: string;
  chainId: number;
  ensAddress?: string;
  _defaultProvider?: (providers: any, options?: any) => any;
};

export default function Hide() {
  const { setAccount, provider, setProvider } = useEthersProvider();

  const connectWallet = useCallback(async () => {
    if (
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined" &&
      provider
    ) {
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
            console.log("Wallet connected");
            toast.success("Wallet connected successfully");
          } catch (err) {
            setAccount(null);
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
            console.log("Wallet connected");
            toast.success("Wallet connected successfully");
          } catch {
            setAccount(null);
            console.log("Please select Ethereum Main Network on Metamask");
            toast.error("Please select Ethereum Main Network on Metamask");
          }
        }
      } else {
        setAccount(null);
        console.log(
          "Wallet error: check the correct functioning of your wallet"
        );
        toast.error(
          "Wallet error: check the correct functioning of your wallet"
        );
      }
    }
  }, [provider, setAccount]);

  return (
    <div className="hide">
      <p>Want to see this ?</p>
      <button onClick={connectWallet}>Connect wallet</button>
    </div>
  );
}
