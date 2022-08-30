## Create .env file
- `PRIVATE_KEY` - private key of one of your Metamask account
- `GOERLI_RPC_URL` - Goerli RPC URL from Alchemy
- `ETHERSCAN_API_KEY` - for contract verification
- `COINMARKETCAP_API_KEY`

## Scripts
- Fund the contract
`npm run fund`
- Withdraw from contract
`npm run withdraw`
- Get info of contract
`npm run info`

## Template for building Hardhat projects in Solidity
- Run the tests
`hh test`
- Run the scripts
`hh run scripts/main.js`
- Compile the smart contracts
`hh compile`
- Deploy contracts
`hh deploy`
- Spin up your local blockchain to test locally
`hh node`
- Deploy contract to a **Goerli (only)** testnet
`hh deploy --network goerli`

##  Frontend (Vite + React + TailwindCSS)
- Start
`npm run dev`
- Build client for IPFS
`npm run build`