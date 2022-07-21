const { assert, expect } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", () => {
    let contract, deployer, mockV3Aggregator;
    const insufficientEth = ethers.utils.parseEther("0.01");
    const sufficientEth = ethers.utils.parseEther("0.1");

    beforeEach(async () => {
      deployer = (await getNamedAccounts()).deployer;
      await deployments.fixture(["all"]);
      contract = await ethers.getContract("FundMe", deployer);
      mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
    });

    describe("constructor", () => {
      it("sets owner correctly", async () => {
        const owner = await contract.getOwner();
        assert.equal(owner, deployer)
      })
    })

    describe("funding", () => {
      it("reverts if no ether is provided", async () => {
        await expect(contract.fund()).to.be.revertedWith("FundMe__InsufficientFunds")
      })
      it("reverts if not enough ether is provided", async () => {
        await expect(contract.fund({ value: insufficientEth })).to.be.revertedWith("FundMe__InsufficientFunds")
      })
      it("accepts if enough ether is provided", async () => {
        await contract.fund({ value: sufficientEth })
        const balance = await contract.totalBalance()
        expect(balance).to.be.equal(sufficientEth)
      })
      it("updates funder array", async () => {
        await contract.fund({ value: sufficientEth })
        const funder = await contract.getFunder(0);
        assert.equal(funder, deployer)
      })
    })

    describe("withdraw", () => {
      const mockUsers = 6;
      beforeEach(async () => {
        await contract.fund({ value: sufficientEth })
      })

      it("allows only the owner to withdraw", async () => {
        const accounts = await ethers.getSigners();
        const attacker = accounts[3];
        const connectedAttacker = await contract.connect(attacker)
        await expect(connectedAttacker.withdraw()).to.be.revertedWith("FundMe__NotOwner")
      })
      it("withdraws from the contract, with 6 funders, to the deployer", async () => {
        const accounts = await ethers.getSigners();
        for (let i = 1; i < mockUsers; i++) {
          const funder = await contract.connect(accounts[i]);
          await funder.fund({ value: sufficientEth })
        }

        const funderNum = await contract.getFunders();
        assert.equal(funderNum.length, mockUsers);

        const startDeployerBalance = await contract.provider.getBalance(deployer)
        const startContractBalance = await contract.totalBalance();

        const tx = await contract.withdraw();
        const txReceipt = await tx.wait(1);
        const { gasUsed, effectiveGasPrice } = txReceipt;
        const gas = gasUsed.mul(effectiveGasPrice)

        const endDeployerBalance = await contract.provider.getBalance(deployer)
        const endContractBalance = await contract.totalBalance();

        assert.equal(endContractBalance, 0)
        assert.equal(
          startDeployerBalance.add(startContractBalance).toString(),
          endDeployerBalance.add(gas).toString()
        )
      })
      it("empties out the funder array and getFundsOfFunder mapping, after withdraw", async () => {
        const accounts = await ethers.getSigners();
        for(let i = 1; i < mockUsers; i++){
          const funder = await contract.connect(accounts[i]);
          await funder.fund({ value: sufficientEth });
        }

        await contract.withdraw();
        
        for(let i = 0; i < mockUsers; i++) {
          const ethBalance = await contract.getFundsOfFunder(accounts[i].address)
          assert.equal(ethBalance, 0);
        }

        const funders = await contract.getFunders();
        expect(funders.length).to.equal(0)
      })
    })
  });
