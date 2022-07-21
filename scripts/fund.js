const { getNamedAccounts, ethers } = require("hardhat");

const main = async () => {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract('FundMe', deployer);
  const tx = await fundMe.fund({ value: ethers.utils.parseEther("0.02") })
  await tx.wait(1);
  console.log("Funded!")
  const balance = await fundMe.totalBalance();
  const ethBalance = ethers.utils.formatEther(balance)
  console.log("Fund balance is", ethBalance, "Ξ")
}

main()
  .then(() => process.exit(1))
  .catch((err) => {
    console.log(err.message);
    process.exit(0);
  });
