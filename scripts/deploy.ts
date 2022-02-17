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

  // We get the contract to deploy
  const NFT = await ethers.getContractFactory("NFT");
  const nft = await NFT.deploy();

  await nft.deployed();

  const result = await ethers.getSigners();
  let user = result[0]
  console.log(user.address)

  console.log("NFT deployed to:", nft.address);

  let set = await nft.setBaseTokenURI('https://ipfs.io/ipfs/bafybeihmxociuwoqxdmj7z5oea2qkkgv6mpcf4vy4volmjp6jwgc2r5xwa/')
  await set.wait()

  let mint = await nft.mintTo(user.address)
  await mint.wait()
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
