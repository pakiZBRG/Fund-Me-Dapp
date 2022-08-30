const networkConfig = {
  5: {
    name: "goerli",
    ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"
  },
  31337: {
    name: "localhost"
  },
};

const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8;
const MOCK_PRICE = 1500 * 1e8;

module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  MOCK_PRICE
};
