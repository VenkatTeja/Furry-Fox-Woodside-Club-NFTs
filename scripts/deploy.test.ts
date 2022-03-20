// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  const result = await ethers.getSigners();
  let user = result[0]
  console.log(user.address)

  let clientTestAddress = '0xb0Fb91eB0f26c79E66d002F66a80A6E95BA3E462'

  // We get the contract to deploy
  let wyvernProxyRinkeby = '0xf57b2c51ded3a29e6891aba85459d600256cf317'
  // const nft = await ethers.getContractAt("FFWClubNFT", '0xb0A7b60C696688583B6d76f767cBcc767771ca4d');
  const NFT = await ethers.getContractFactory('FFWClubNFT')
  const nft = await NFT.deploy(wyvernProxyRinkeby, 100);

  await nft.deployed();

  console.log("NFT deployed to:", nft.address);

  const Factory = await ethers.getContractFactory('FFWClubFactory')
  const factory = await Factory.deploy(wyvernProxyRinkeby, nft.address)
  await factory.deployed()
  console.log("Factory deployed to:", factory.address);

  await (await (factory.setBaseURI('ipfs://bafybeibeb2t5dmq2nggyuclyeh5yv7trc46q2mu5pxblxrgy2dfdmny7rq/out/'))).wait()
  console.log('factory base url set')
  await (await nft.setBaseURI('ipfs://bafybeibeb2t5dmq2nggyuclyeh5yv7trc46q2mu5pxblxrgy2dfdmny7rq/out/')).wait()
  console.log('base uri set')
  await (await nft.setLimits(5, 5, 5, 5, 10, 10, 20)).wait()
  console.log('limits set')
  await (await nft.setPhase(1)).wait()
  console.log('phase set to pre-sale')
  let mintPrice = ethers.utils.parseEther('0.001').toString()
  await (await nft.setMintPrice(mintPrice)).wait()
  let value = ethers.utils.parseEther('0.001')
  await (await nft.mintTo(user.address, 1, {value: value.toString()})).wait()
  console.log('nft minted')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// meta files
// https://bafybeibeb2t5dmq2nggyuclyeh5yv7trc46q2mu5pxblxrgy2dfdmny7rq.ipfs.dweb.link/out/
