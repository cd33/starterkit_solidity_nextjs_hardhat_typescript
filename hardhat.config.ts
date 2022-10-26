import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config"
import "@typechain/hardhat"

const GOERLI_RPC_URL = process.env.INFURA_GOERLI || "";
const PRIVATE_KEY_TEST = process.env.PRIVATE_KEY_TEST || "";
const ETHERSCAN = process.env.ETHERSCAN || "";

const config: HardhatUserConfig = {
  solidity: "0.8.7",
  defaultNetwork: "hardhat",
  networks: {
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY_TEST],
      chainId: 5
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    }
  },
  etherscan: {
    apiKey: ETHERSCAN
  },
  gasReporter: {
    enabled: true
  }
};

export default config;
