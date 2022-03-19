const opensea = require("opensea-js");
const OpenSeaPort = opensea.OpenSeaPort;
const Network = opensea.Network;

const PrivateKeyWalletSubprovider = require('@0x/subproviders').PrivateKeyWalletSubprovider // subproviders import
const RPCSubprovider = require("web3-provider-engine/subproviders/rpc");
const Web3ProviderEngine = require("web3-provider-engine");
import { ethers } from "hardhat";

if(!process.env.RINKBY_RPC)
    throw new Error('only supports RINKBY for now')

const infuraRpcSubprovider = new RPCSubprovider({
    rpcUrl: process.env.RINKBY_RPC
});
    
const privateKeyWalletSubprovider = new PrivateKeyWalletSubprovider(process.env.PRIVATE_KEY)
const providerEngine = new Web3ProviderEngine();
providerEngine.addProvider(privateKeyWalletSubprovider);
providerEngine.addProvider(infuraRpcSubprovider);
providerEngine.start();

async function main() {
  const seaport = new OpenSeaPort(
    providerEngine,
    {
      networkName: Network.Rinkeby,
      apiKey: process.env.OPENSEA_API
    }
  );

  const result = await ethers.getSigners();
  let user = result[0]
  console.log(user.address)

    // We get the contract to deploy
    // 0x732E9a4e88cADb55c369616d388d11c82a346d6b
  const nft = await ethers.getContractAt("NFT", '0x084b2F8c98B6A8b5B1BA062e2A1B1c5fCC937152')
  // const NFT = await ethers.getContractFactory("NFT")
  // const nft = await NFT.deploy('0x1e525eeaf261ca41b809884cbde9dd9e1619573a');
  // await nft.deployed();
  console.log('NFT deployed', nft.address)

  let set = await nft.setBaseTokenURI('https://ipfs.io/ipfs/bafybeihmxociuwoqxdmj7z5oea2qkkgv6mpcf4vy4volmjp6jwgc2r5xwa/')
  await set.wait()

  // const MyFactory = await ethers.getContractFactory('MyFactory');
  // const myFactory = await MyFactory.deploy('0x1e525eeaf261ca41b809884cbde9dd9e1619573a', nft.address);

  // await myFactory.deployed();
  
  const myFactory = await ethers.getContractAt("MyFactory", "0x7b5ee2E95B2B8c656dD8eeFd7a9D80192FE88253", user)
  console.log('Factory deployed', myFactory.address)

//   let mint = await myFactory.mint(0, user.address)
//   await mint.wait()
//   mint = await myFactory.mint(0, user.address)
//   await mint.wait()


  console.log("Creating fixed price auctions...");
  const fixedSellOrders = await seaport.createFactorySellOrders({
    assets: [
      {
        tokenId: 0,
        tokenAddress: myFactory.address,
      }
    ],
    accountAddress: user.address,
    startAmount: 0.001,
    numberOfOrders: 1,
  });
  console.log('orders created', fixedSellOrders.length)
  console.log(fixedSellOrders);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});