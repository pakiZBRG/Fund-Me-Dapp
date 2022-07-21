require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");

module.exports = {
  solidity: {
    compilers: [
      { version: "0.6.6" },
      { version: "0.8.8" },
    ],
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        url: process.env.MAINNET_RPC_URL,
      },
      blockConfirmations: 1,
    },
    localhost: {
      chainId: 31337,
    },
    rinkeby: {
      url: process.env.RINKEBY_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 4,
      blockConfirmations: 6,
    },
  },
  gasReporter: {
    enabled: false,
    currency: "USD",
    outputFile: "gas-reporter.txt",
    noColors: true,
  },
  namedAccounts: {
    deployer: {
      default: 0, // default to account[0]
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  mocha: {
    timeout: 200000, // 200s
  },
};
