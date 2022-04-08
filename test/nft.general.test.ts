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
        let wallets: any[];
        let owner: SignerWithAddress, addr1: SignerWithAddress, addr2: SignerWithAddress;
        let addr3: SignerWithAddress, addr4: SignerWithAddress;
        before(async () => {
            [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners()
            console.log({owner: owner.address})
            let wyvernProxy = '0xf57b2c51ded3a29e6891aba85459d600256cf317'
            const NFT = await ethers.getContractFactory("FFWClubNFT")
            nft = await NFT.deploy(wyvernProxy, 10,
                process.env.WETH || "")

            await nft.deployed();
            // const nft = await ethers.getContractAt("NFT", '0x074Ab06D4dFFA3aD9d392F2Ab3C07776496dc96A')
            console.log('Deployed NFT.sol', nft.address)

        })
    
        it('set phase and mint price', async () => {
            let price = ethers.utils.parseEther('0.001').toString()
            let tx = await nft.setPhaseAndMintPrice(1, price)
            await tx.wait()
            let phase = await nft.phase()
            expect(phase == phase)
            let errorThrown = false
            try {
                let tx = await nft.setPhaseAndMintPrice(0, price)
                await tx.wait()
            } catch(err: any) {
                errorThrown = true
                expect(err.message.includes('can only advance phases')).to.equal(true)
            }
            if(!errorThrown)
                throw new Error('should have thrown "can only advance phases" err')

            try {
                let tx = await nft.connect(addr1).setPhaseAndMintPrice(1, price)
                await tx.wait()
            } catch(err: any) {
                return expect(err.message.includes('caller is not the owner')).to.equal(true)
            }
            throw new Error('set phase should have failed for non-owner')
        })

        it('set base URI', async () => {
            let tx = await nft.setBaseURI('myurl')
            await tx.wait()

            let baseURI = await nft.baseURI()
            expect(baseURI == 'myurl')

            try {
                let tx = await nft.connect(addr1).setBaseURI('myurl')
                await tx.wait()
            } catch(err: any) {
                return expect(err.message.includes('caller is not the owner')).to.equal(true)
            }
            throw new Error('set base URI should have failed for non-owner')
        })
    });
});
