import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { abi, contractAddress } from './contract';
import { ToastContainer, toast } from 'react-toastify';
import { Footer, Main, Nav } from './components';
import { formatBigNumber } from './utils'
import 'react-toastify/dist/ReactToastify.css';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const App = () => {
    const [owner, setOwner] = useState('');
    const [sendAmount, setSendAmount] = useState('');
    const [price, setPrice] = useState('');
    const [totalFunded, setTotalFunded] = useState('');
    const [addressOfContract, setAddressOfContract] = useState('')
    const [minimumUSD, setMinimumUSD] = useState('');
    const [account, setAccount] = useState({ address: '', balance: '' });
    const [metamaskMessage, setMetamaskMessage] = useState(false);
    const [funders, setFunders] = useState([]);
    const [loading, setLoading] = useState({ fund: false, withdraw: false });
    const [chainMessage, setChainMessage] = useState('');

    const totalFundedInUsd = ((totalFunded * price).toFixed(2)).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")

    const getContract = async (signerOrProvider) => {
        const network = await provider.getNetwork();
        const address = contractAddress[network.chainId.toString()];
        const contract = new ethers.Contract(address, abi, signerOrProvider);
        return contract
    }

    const getEthPrice = async () => {
        const contract = await getContract(provider);
        const price = await contract.getEthPrice();
        const numPrice = formatBigNumber(price, 2)
        setPrice(numPrice)
        return numPrice
    }

    const getFunds = async () => {
        const contract = await getContract(provider);
        setAddressOfContract(contract.address)
        const funds = await provider.getBalance(contract.address);
        const numEth = formatBigNumber(funds, 3)
        setTotalFunded(numEth)
    }

    const minimumFund = async () => {
        const contract = await getContract(provider);
        const ethPrice = await getEthPrice();
        const minUsd = await contract.getMinimumUSD();
        const numMinUsd = formatBigNumber(minUsd, 2)
        const etherAmount = (+numMinUsd / +ethPrice).toFixed(3).toString();
        setMinimumUSD(etherAmount);
    }

    const connectWallet = async () => {
        const accounts = await provider.send("eth_requestAccounts", []);
        const balance = await signer.getBalance();
        const numEth = formatBigNumber(balance, 3)
        setAccount({ address: accounts[0], balance: numEth })
    }

    const isConnected = async () => {
        const address = await signer.getAddress();
        return address;
    }

    const getFundsOfFunder = async (address) => {
        if (address.length === 42) {
            const filteredFunders = funders.filter(funder => funder.funder === address);
            setFunders(filteredFunders)
        } else {
            await fundEvents()
        }
    }

    const fundEvents = async () => {
        const contract = await getContract(signer);
        const events = await contract.queryFilter('Fund');
        const formattedEvents = events.map(({ args }) => {
            const numAmount = formatBigNumber(args.amount, 3)
            const time = new Date(parseInt(args.timestamp.toString()) * 1000)
            return {
                funder: args.funder,
                amount: numAmount,
                timestamp: time.toString().substr(4, 17)
            }
        })
        setFunders(formattedEvents)
    }

    const getOwner = async () => {
        const contract = await getContract(provider);
        const owner = await contract.getOwner();
        setOwner(owner)
    }

    const sendFunds = async () => {
        try {
            if (+sendAmount <= +minimumUSD) {
                toast.info("Please input minimum of 0.0135 ETH")
                return;
            }
            setLoading({ fund: true })
            const contract = await getContract(signer);
            const amountInWei = ethers.utils.parseUnits(sendAmount, 18)

            const tx = await contract.fund({ value: amountInWei });
            await tx.wait(1)
            setLoading({ fund: false })

            connectWallet();
            getFunds();
            setSendAmount('');
            fundEvents();
            toast.info("Transaction completed")
        } catch (error) {
            setLoading({ fund: false })
            if (error.data.message.includes("FundMe__InsufficientFunds")) {
                toast.error("Not enough ETH")
            } else {
                console.log(error.message)
            }
        }
    }

    const withdraw = async () => {
        try {
            const contract = await getContract(signer);
            setLoading({ withdraw: true })

            const tx = await contract.withdraw();
            await tx.wait(1)
            setLoading({ withdraw: false })

            connectWallet();
            getFunds();
            toast.info("Funds withdrawn")
        } catch (error) {
            setLoading({ withdraw: false })
            if (error.message.includes("FundMe__NotOwner")) {
                toast.error("Not an owner of the contract")
            } else {
                console.log(error.message)
            }
        }
    }

    useEffect(() => {
        if (typeof ethereum !== 'undefined') {
            ethereum.on('accountsChanged', async accounts => {
                if (accounts.length) {
                    await connectWallet()
                } else {
                    setAccount({ address: "", balance: "" })
                }
            });
            ethereum.on('chainChanged', chainId => {
                if (contractAddress[+chainId]) {
                    setChainMessage("")
                } else {
                    setChainMessage("Please use Rinkeby")
                }
            });
            getContract();
            getEthPrice();
            getFunds();
            fundEvents();
            minimumFund();
            getOwner();
            isConnected()
                .then(async () => await connectWallet())
                .catch(err => console.log(err.message))
        } else {
            setMetamaskMessage(true)
        }
    }, [])

    const sendAllEther = () => {
        // leave 2% of all funds
        setSendAmount((+account.balance - (+account.balance / 50)).toFixed(3).toString())
    }

    return (
        <div className='bg-gradient min-h-screen flex flex-col'>
            <ToastContainer position='bottom-right' theme='dark' />
            <Nav
                account={account}
                metamaskMessage={metamaskMessage}
                connectWallet={connectWallet}
            />
            <Main
                totalFunded={totalFunded}
                totalFundedInUsd={totalFundedInUsd}
                address={account.address}
                chainMessage={chainMessage}
                sendAmount={sendAmount}
                setSendAmount={setSendAmount}
                sendAllEther={sendAllEther}
                sendFunds={sendFunds}
                loading={loading}
                funders={funders}
                withdraw={withdraw}
                owner={owner}
                minimumUSD={minimumUSD}
                getFundsOfFunder={getFundsOfFunder}
            />
            <Footer price={price} addressOfContract={addressOfContract} />
        </div >
    )
}

export default App
