import React from 'react'
import { FaEthereum } from 'react-icons/fa'
import { BsCodeSlash } from 'react-icons/bs'

const Footer = ({ price, addressOfContract }) => {
    return (
        <footer className='m-4 flex flex-row justify-between'>
            <div className='flex flex-row  items-center'>
                <a
                    className='black-glassmorphism text-sm w-28 text-slate-300 px-4 py-2 rounded-full flex items-center'
                    href='https://www.coingecko.com/en/coins/ethereum'
                    target={'_blank'}
                >
                    <FaEthereum className='text-lg mr-1 text-slate-400' />{price}
                </a>
                <a href={`https://rinkeby.etherscan.io/address/${addressOfContract}`} target={'_blank'} className='underline text-slate-200 text-sm ml-4'>Contract</a>
            </div>
            <div className='flex flex-row items-center'>
                <a href='https://github.com/pakiZBRG/Fund-Me-Dapp' target={'_blank'} className='text-slate-100 text-xl'>
                    <BsCodeSlash />
                </a>
            </div>
        </footer>
    )
}

export default Footer