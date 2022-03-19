import { expect } from "chai";
import { ethers } from "hardhat";

describe("Factory", function () {
  it("Mint Factory", async function () {
    let [owner] = await ethers.getSigners()
    console.log({owner: owner.address})
    let wyvernProxy = '0xf57b2c51ded3a29e6891aba85459d600256cf317'
    const NFT = await ethers.getContractFactory("NFT")
    const nft = await NFT.deploy(wyvernProxy)

    await nft.deployed();
    // const nft = await ethers.getContractAt("NFT", '0x074Ab06D4dFFA3aD9d392F2Ab3C07776496dc96A')
    console.log('Deployed NFT.sol', nft.address)

    const MyFactory = await ethers.getContractFactory("MyFactory");
    const myFactory = await MyFactory.deploy(wyvernProxy, nft.address)
    await myFactory.deployed();
    // const myFactory = await ethers.getContractAt("MyFactory", '0x1f3B708e79f68f0fb19f21076E6D34D0A66c22A1')
    console.log('Deployed MyFactory.sol', myFactory.address)

    // let tx = await nft.transferOwnership(myFactory.address)
    // await tx.wait()

    // let tx = await nft.connect(owner).mintTo(owner.address)
    // await tx.wait()

    tx = await myFactory.connect(owner).mint(0, owner.address)
    await tx.wait()
    console.log(tx)
  });
});
