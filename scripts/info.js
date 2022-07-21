const { getNamedAccounts, ethers, network } = require("hardhat")
const { developmentChains } = require('../helper-hardhat-config')

const main = async () => {
    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe", deployer);
    const ethPrice = await fundMe.getEthPrice();
    const balance = await fundMe.totalBalance();

    if(developmentChains.includes(network.name)) {
        console.log("Localhost detected...")
    } else {
        console.log("Address of contract", fundMe.address)
    }
    console.log("ETH price is", ethers.utils.formatEther(ethPrice))
    console.log("Balance is", ethers.utils.formatEther(balance), 'Ξ')
}

main()
    .then(() => process.exit(1))
    .catch((error) => {
        console.log(error.message)
        process.exit(0)
    })