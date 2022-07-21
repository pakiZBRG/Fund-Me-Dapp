const { network } = require('hardhat');
const { DECIMALS, MOCK_PRICE, developmentChains } = require('../helper-hardhat-config')

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  if(developmentChains.includes(network.name)) {
    console.log("Local development detected!")
    await deploy("MockV3Aggregator", {
      from: deployer,
      args: [DECIMALS, MOCK_PRICE],
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
    });
    log("Mocks deployed!\n");
  }
};

module.exports.tags = ["all", "mocks"];
