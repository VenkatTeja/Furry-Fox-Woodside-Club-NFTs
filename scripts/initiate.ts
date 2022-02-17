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
      apiKey: '5bec8ae0372044cab1bef0d866c98618'
    }
  );

  const result = await ethers.getSigners();
  let user = result[0]
  console.log(user.address)

    // We get the contract to deploy
    // 0x732E9a4e88cADb55c369616d388d11c82a346d6b
  const nft = await ethers.getContractAt("NFT", '0x4D2D1153553c49b9Ed5e6Bce93B2458B6afE85EB')
//   const NFT = await ethers.getContractFactory("NFT")
//   const nft = await NFT.deploy('0xf57b2c51ded3a29e6891aba85459d600256cf317');
//   await nft.deployed();
  console.log('NFT deployed', nft.address)

//   let set = await nft.setBa('https://ipfs.io/ipfs/bafybeihmxociuwoqxdmj7z5oea2qkkgv6mpcf4vy4volmjp6jwgc2r5xwa/')
//   await set.wait()

//   const MyFactory = await ethers.getContractFactory('MyFactory');
//   const myFactory = await MyFactory.deploy('0xf57b2c51ded3a29e6891aba85459d600256cf317', nft.address);

//   await myFactory.deployed();
  
  const myFactory = await ethers.getContractAt("MyFactory", "0xbDBF2A7C4D7d484cdeC877B24263395803199B8e", user)
  console.log('Factory deployed', myFactory.address)

//   let mint = await myFactory.mint(0, user.address)
//   await mint.wait()
//   mint = await myFactory.mint(0, user.address)
//   await mint.wait()


  console.log("Creating fixed price auctions...");
  const fixedSellOrders = await seaport.createFactorySellOrders({
    assets: [
      {
        tokenId: 1,
        tokenAddress: myFactory.address,
      },
      {
        tokenId: 1,
        tokenAddress: myFactory.address,
      },
      {
        tokenId: 1,
        tokenAddress: myFactory.address,
      },
    ],
    accountAddress: user.address,
    startAmount: 0.05,
    numberOfOrders: 1,
  });
  console.log('orders created', fixedSellOrders.length)
  console.log(fixedSellOrders);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});