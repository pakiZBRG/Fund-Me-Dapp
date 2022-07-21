import Loader from './Loader'
import { FiInfo, FiSearch } from 'react-icons/fi'

const Main = ({ totalFunded, totalFundedInUsd, address, chainMessage, sendAmount, setSendAmount, sendAllEther, sendFunds, loading, funders, withdraw, owner, minimumUSD, getFundsOfFunder }) => {
    return (
        <>
            <article className='py-12 flex flex-col items-center'>
                <h1 className='text-6xl text-slate-200'>
                    {totalFunded}
                    <span className='text-3xl text-slate-400'> ETH</span>
                </h1>
                <h5 className='pt-1 pb-12 text-slate-300'>${totalFundedInUsd}</h5>
                {address ?
                    <>
                        {chainMessage ?
                            <p className='text-slate-100 text-xl'>{chainMessage}</p>
                            :
                            <section className='flex flex-col'>
                                <div className='flex md:flex-row flex-col'>
                                    <div className='flex-1 white-glassmorphism rounded-full'>
                                        <input
                                            type={'number'}
                                            className='px-5 py-2 bg-transparent text-white outline-none rounded-full'
                                            onChange={e => setSendAmount(e.target.value)}
                                            value={sendAmount}
                                        />
                                        <button className='text-slate-400 mr-2 p-1 text-sm rounded hover:bg-[#ffffff11] duration-200' onClick={sendAllEther}>MAX</button>
                                        <button onClick={sendFunds} disabled={loading.fund} className={`${loading.fund ? 'bg-rose-400' : 'bg-rose-600'} hover:shadow-rose-500/20 duration-300 shadow-xl text-sm text-white px-5 h-10 rounded-full`}>
                                            {!loading.fund ? 'Send Funds' : <Loader />}
                                        </button>
                                    </div>
                                    <button
                                        onClick={withdraw}
                                        disabled={owner.toLowerCase() !== address.toLowerCase() || loading.withdraw}
                                        className={`hover:shadow-blue-500/20 duration-300 shadow-xl ml-3 text-white px-5 py-2 rounded-full text-sm mt-5 md:mt-0 ${loading.withdraw ? 'bg-blue-500' : 'bg-blue-700'} ${owner.toLowerCase() !== address.toLowerCase() && 'cursor-not-allowed bg-blue-400'}`}
                                    >
                                        {!loading.withdraw ? 'Withdraw' : <Loader />}
                                    </button>
                                </div>
                                <span className='text-[.8rem] mt-1 text-slate-500'>
                                    Minimum:
                                    <span className='font-bold text-white ml-1'>{minimumUSD} ETH</span>
                                </span>
                            </section>
                        }
                    </>
                    :
                    <p className='text-xl text-slate-100'>Connect to your Metamask</p>
                }
            </article>
            <article className='flex flex-col xl:flex-row lg:w-9/12 w-11/12 m-auto mt-16 text-[.9rem]'>
                <section className='flex-1 m-6 p-6 text-slate-300 black-glassmorphism'>
                    <p>Project used for funding and withdrawing from the smart contract. The technologies that are used are <b>Solidity</b>, <b>Hardhat</b>, <b>React</b> and <b>TailwindCSS</b>. Functionality are as followed:</p>
                    <ul className='list-disc ml-8 mt-1'>
                        <li>Read the balance and address of wallet</li>
                        <li>Fund the project</li>
                        <li>Minimum amount to fund</li>
                        <li>Withdraw from project (only owner)</li>
                        <li>Display all funders with timestamp and amount</li>
                        <li>Query the funders</li>
                        <li>Get price of Ether</li>
                    </ul>
                </section>
                <section className='flex-1 m-6 p-6'>
                    <div className='flex mb-4'>
                        <div className='white-glassmorphism px-3 w-full py-2 flex items-center'>
                            <FiSearch className='text-slate-300 mr-2' size={'1rem'} />
                            <input
                                onChange={e => getFundsOfFunder(e.target.value)}
                                className='bg-transparent w-full text-slate-100 outline-none mt-1'
                                placeholder='Get funds of address'
                            />
                        </div>
                    </div>
                    <div className='overflow-y-auto h-60 black-glassmorphism scrollbar text-slate-100 ' style={{ borderTopRightRadius: '4px', borderBottomRightRadius: "4px" }}>
                        {funders.length ?
                            <>
                                {funders.map(({ amount, funder, timestamp }, i) => (
                                    <div key={i} className='text-sm px-4 pt-2'>
                                        <div className='flex justify-between'>
                                            <span className='text-slate-300'>{funder}</span>
                                            <span className='font-bold ml-3'>{amount}</span>
                                        </div>
                                        <small className='flex flex-row-reverse'>{timestamp}</small>
                                    </div>
                                ))}
                            </>
                            :
                            <div className='flex-col mt-20'>
                                <FiInfo className='text-blue-500 text-2xl' style={{ margin: '0 auto' }} />
                                <p className='mt-1 text-center'>No transaction reported</p>
                            </div>
                        }
                    </div>
                </section>
            </article>
        </>
    )
}

export default Main;