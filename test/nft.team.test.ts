import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { FFWClubNFT } from "../typechain";
const keccak256 = require('keccak256')
const { MerkleTree } = require('merkletreejs')

function iThrowError() {
    throw new Error("Error thrown");
}

describe("NFT", function () {
  describe("NFT Team minting test", async function () {
      let root: any, merkleTree: any, nft: FFWClubNFT;
      let price = ethers.utils.parseEther('0.5').toString()
      let wallets: any[];
      let owner: SignerWithAddress, addr1: SignerWithAddress, addr2: SignerWithAddress;
      let addr3: SignerWithAddress, addr4: SignerWithAddress;
      before(async () => {
        [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners()
        console.log({owner: owner.address})
        let wyvernProxy = '0xf57b2c51ded3a29e6891aba85459d600256cf317'
        const NFT = await ethers.getContractFactory("FFWClubNFT")
        nft = await NFT.deploy(wyvernProxy, 10)

        await nft.deployed();
        // const nft = await ethers.getContractAt("NFT", '0x074Ab06D4dFFA3aD9d392F2Ab3C07776496dc96A')
        console.log('Deployed NFT.sol', nft.address)

        let whitelistLeaves = [addr1.address, addr2.address]
        whitelistLeaves = whitelistLeaves.map(addr => keccak256(addr))
        merkleTree = new MerkleTree(whitelistLeaves, keccak256, {sortPairs: true})
        root = merkleTree.getHexRoot()

        let hashedAddress = keccak256(addr1.address)
        let proof = merkleTree.getHexProof(hashedAddress)
        merkleTree.verify(proof, hashedAddress, root)
      })
    
    it('set limits', async () => {
        let tx = await nft.setLimits(10, 3, 4, 5, 10, 10, 10)
        await tx.wait()
    })
    
    it('set team merkle root', async () => {
        let tx = await nft.setTeamMerkleRoot(root)
        await tx.wait()
    })

    it('set limits', async () => {
        let tx = await nft.setLimits(3, 3, 4, 5, 6, 8, 10)
        await tx.wait();
    })

    it('[LOCKED] mint with allowed user1', async () => {
        let hashedAddress = keccak256(addr1.address)
        let proof = merkleTree.getHexProof(hashedAddress)
        try {
            let tx = await nft.connect(addr1).mintToTeam(proof, 1)
            await tx.wait()
        } catch(err) {return;}
        throw new Error('mint should have failed, but didnt')
    })

    it('set phase to pre-sale', async () => {
        let tx = await nft.setPhase(1)
        await tx.wait()
    })

    it('[PRESALE] mint with allowed user1 mint 1: should pass', async () => {
        let hashedAddress = keccak256(addr1.address)
        let proof = merkleTree.getHexProof(hashedAddress)
        let tx = await nft.connect(addr1).mintToTeam(proof, 1)
        await tx.wait()

        let balance = await nft.teamCounter(addr1.address)
        expect(balance.toString()).to.equal('1')
    })

    it('[PRESALE] mint with allowed user2 mint 2: should pass', async () => {
        let hashedAddress = keccak256(addr2.address)
        let proof = merkleTree.getHexProof(hashedAddress)
        let tx = await nft.connect(addr2).mintToTeam(proof, 2)
        await tx.wait()
    })

    it('[PRESALE] mint with allowed user2 mint 2 more: should fail [limit breach]', async () => {
        let hashedAddress = keccak256(addr2.address)
        let proof = merkleTree.getHexProof(hashedAddress)
        try {
            let tx = await nft.connect(addr2).mintToTeam(proof, 2)
            await tx.wait()
        } catch(err) {return;}
        throw new Error('mint should have failed, but didnt')
    })

    it('[PRESALE] mint with un-allowed user3 mint 1: should fail', async () => {
        let hashedAddress = keccak256(addr3.address)
        let proof = merkleTree.getHexProof(hashedAddress)
        try {
            let tx = await nft.connect(addr3).mintToTeam(proof, 1)
            await tx.wait()
        } catch(err) {return;}
        throw new Error('mint should have failed, but didnt')
    })

    it('set phase to public-sale', async () => {
        let tx = await nft.setPhase(2)
        await tx.wait()
    })

    it('set mint price', async () => {
        let tx = await nft.setMintPrice(price)
        await tx.wait()
    })

    it('[PUBLICSALE] mint with un-allowed user3 mint 4: should fail [less fee given]', async () => {
        try {
            let pless = ethers.utils.parseEther('0.99')
            let tx = await nft.connect(addr3).mintTo(addr3.address, 4, {value: pless.toString()})
            await tx.wait()
        } catch(err: any) {
            return expect(err.message.includes('Ether value sent is not correct')).to.equal(true)
        }
        throw new Error('mint should have failed, but didnt')
    })

    it('[PUBLICSALE] mint with un-allowed user3 mint 4: should pass', async () => {
        let pless = ethers.utils.parseEther('2')
        let tx = await nft.connect(addr3).mintTo(addr3.address, 4, {value: pless.toString()})
        await tx.wait()
    })

    it('[PUBLICSALE] mint with un-allowed user4 mint 4: should fail [overall limit check]', async () => {
        try {
            let pless = ethers.utils.parseEther('2')
            let tx = await nft.connect(addr4).mintTo(addr4.address, 4, {value: pless.toString()})
            await tx.wait()
        } catch(err: any) {
            return expect(err.message.includes('Supply exceeding')).to.equal(true)
        }
        throw new Error('mint should have failed, but didnt')
    })

    it('[PUBLICSALE] mint with un-allowed user4 mint 8: should fail [wallet limit check]', async () => {
        try {
            let pless = ethers.utils.parseEther('4')
            let tx = await nft.connect(addr3).mintTo(addr3.address, 8, {value: pless.toString()})
            await tx.wait()
        } catch(err: any) {
            return expect(err.message.includes('You are exceeding max limit per wallet')).to.equal(true)
        }
        throw new Error('mint should have failed, but didnt')
    })
  });
});
