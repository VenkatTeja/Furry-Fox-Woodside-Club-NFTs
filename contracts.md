### Set parameters in NFT.sol and factory.sol

## Base URIs
Upload all images as .car in nft.storage
and use this url to generate json files. Then upload all these json files without extension into nft.storage  
And use this final url as base uri in NFT contract. remember to set ipfs url.

## For pre-sale
choose a presale image and set that as image url in metajson files and generate them. 
Upload them somewhere (need not be ipfs) such that, 
{{baseurl}}/{{tokenid}} should result in metajson

Once we reveal NFTs, we shall update the base urls of both factory and nft contracts

## Verify contract on etherscan
`npx hardhat verify --network mainnet DEPLOYED_CONTRACT_ADDRESS "Constructor argument 1"`
Example:
`npx hardhat verify --network rinkeby 0xb0A7b60C696688583B6d76f767cBcc767771ca4d "0xf57b2c51ded3a29e6891aba85459d600256cf317" "100"`