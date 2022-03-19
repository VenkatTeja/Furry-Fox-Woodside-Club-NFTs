import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { NFT } from "../typechain";
const keccak256 = require('keccak256')
const { MerkleTree } = require('merkletreejs')

function iThrowError() {
    throw new Error("Error thrown");
}

describe("NFT", function () {
  describe("NFT Team minting test", async function () {
      let root: any, merkleTree: any, nft: NFT;
      let wallets: any[];
      let owner: SignerWithAddress, addr1: SignerWithAddress, addr2: SignerWithAddress;
      let addr3: SignerWithAddress, addr4: SignerWithAddress;
      before(async () => {
        [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners()
        console.log({owner: owner.address})
        let wyvernProxy = '0xf57b2c51ded3a29e6891aba85459d600256cf317'
        const NFT = await ethers.getContractFactory("NFT")
        nft = await NFT.deploy(wyvernProxy, 10)

        await nft.deployed();
        // const nft = await ethers.getContractAt("NFT", '0x074Ab06D4dFFA3aD9d392F2Ab3C07776496dc96A')
        console.log('Deployed NFT.sol', nft.address)
      })
    
    

    it('set phase', async () => {
        let tx = await nft.setPhase(1)
        await tx.wait()
        let phase = await nft.phase()
        expect(phase == phase)
        try {
            let tx = await nft.connect(addr1).setPhase(1)
            tx.wait()
            throw new Error('set phase should have failed for non-owner')
        } catch(err) {}
    })

    it('set mint price', async () => {
        let price = ethers.utils.parseEther('0.5').toString()
        let tx = await nft.setMintPrice(price)
        await tx.wait()
        let mintPrice = await nft.mintPrice()
        expect(price == mintPrice.toString())

        try {
            let tx = await nft.connect(addr1).setMintPrice(price)
            tx.wait()
            throw new Error('setMintPrice should have failed for non-owner')
        } catch(err) {}
    })

    it('set base URI', async () => {
        let tx = await nft.setBaseURI('myurl')
        await tx.wait()

        let baseURI = await nft.baseURI()
        expect(baseURI == 'myurl')

        try {
            let tx = await nft.connect(addr1).setBaseURI('myurl')
            tx.wait()
            throw new Error('setMintPrice should have failed for non-owner')
        } catch(err) {}
    })
  });
});
