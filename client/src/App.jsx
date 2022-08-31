import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { abi, contractAddress } from './contract';
import { ToastContainer, toast } from 'react-toastify';
import { Footer, Main, Nav } from './components';
import { formatBigNumber } from './utils'
import 'react-toastify/dist/ReactToastify.css';

let provider, signer
if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner()
}

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

    const getCurrentNetwork = async () => {
        const network = await provider.getNetwork();
        if (contractAddress[+network.chainId]) {
            setChainMessage("")
        } else {
            setChainMessage("Please use Goerli network")
            if (!contractAddress[+network.chainId]) {
                await ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x5' }]
                });
            }
            window.location.reload()
        }
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
        const funds = await contract.totalBalance();
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
            const sortEvents = filteredFunders.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
            setFunders(sortEvents)
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
        const sortEvents = formattedEvents.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        setFunders(sortEvents)
    }

    const getOwner = async () => {
        const contract = await getContract(provider);
        const owner = await contract.getOwner();
        setOwner(owner)
    }

    const sendFunds = async () => {
        try {
            if (+sendAmount < +minimumUSD) {
                toast.info(`Please input minimum of ${minimumUSD} ETH`)
                return;
            }
            setLoading({ fund: true })
            const contract = await getContract(signer);
            const amountInWei = ethers.utils.parseUnits(sendAmount, 18)

            const tx = await contract.fund({ value: amountInWei });
            toast.info("Transaction is being mined. Please wait...")
            await tx.wait(1)
            setLoading({ fund: false })

            connectWallet();
            getFunds();
            setSendAmount('');
            fundEvents();
            toast.success("Transaction completed")
        } catch (error) {
            setLoading({ fund: false })
            if (error.message.includes("FundMe__InsufficientFunds")) {
                toast.error("Not enough ETH")
            } else if (error.message.includes("User denied transaction signature")) {
                toast.info("Transaction cancelled")
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
            toast.info("Transaction is being mined. Please wait...")
            await tx.wait(1)
            setLoading({ withdraw: false })

            connectWallet();
            getFunds();
            toast.success("Funds withdrawn")
        } catch (error) {
            setLoading({ withdraw: false })
            if (error.message.includes("FundMe__NotOwner")) {
                toast.error("Not an owner of the contract")
            } else if (error.message.includes("User denied transaction signature")) {
                toast.info("Transaction cancelled")
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
                    setChainMessage("Please use Goerli network")
                }
            });

            getCurrentNetwork();
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
        // leave 1% of all funds
        setSendAmount((+account.balance - (+account.balance / 100)).toFixed(3).toString())
    }

    return (
        <>
            <ToastContainer position='bottom-right' theme='dark' />
            <div className='bg-gradient min-h-screen flex flex flex-col justify-between'>
                <Nav
                    account={account}
                    metamaskMessage={metamaskMessage}
                    connectWallet={connectWallet}
                />
                {chainMessage ?
                    <p className='text-center mt-16 text-3xl text-white'>{chainMessage}</p>
                    :
                    <Main
                        totalFunded={totalFunded}
                        totalFundedInUsd={totalFundedInUsd}
                        address={account.address}
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
                }
                <Footer price={price} addressOfContract={addressOfContract} />
            </div >
        </>
    )
}

export default App
