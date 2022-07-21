const { getNamedAccounts, ethers } = require("hardhat")

const main = async () => {
    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe", deployer);
    const balance = await fundMe.totalBalance();
    const ethBalance = ethers.utils.formatEther(balance);
    console.log('Withdrawing',ethBalance, 'Ξ by', deployer);
    const tx = await fundMe.withdraw();
    await tx.wait(1);
    console.log('Withdrawn!');
}

main()
    .then(() => process.exit(1))
    .catch((err) => {
        console.log(err.message)
        process.exit(0)
    })