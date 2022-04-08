import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { FFWClubNFT } from "../typechain";
import * as lib from './lib'
const keccak256 = require('keccak256')
const { MerkleTree } = require('merkletreejs')

function iThrowError() {
    throw new Error("Error thrown");
}

describe("NFT", function () {
  describe("NFT Team minting test", async function () {
      let root: any, merkleTree: any, nft: FFWClubNFT;
      let price = ethers.utils.parseEther('0.001').toString()
      let wallets: any[];
      let owner: SignerWithAddress, addr1: SignerWithAddress, addr2: SignerWithAddress;
      let addr3: SignerWithAddress, addr4: SignerWithAddress;
      before(async () => {
        [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners()
        const signers = await ethers.getSigners()
        console.log({owner: owner.address})
        let wyvernProxy = '0xf57b2c51ded3a29e6891aba85459d600256cf317'
        const NFT = await ethers.getContractFactory("FFWClubNFT")
        nft = await NFT.deploy(wyvernProxy, 10, process.env.WETH || "")

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

        for(let i=0; i < 5; ++i) {
            let signer = signers[i]
            let bal = await lib.getTokenBalance(signer, lib.TOKENS.WETH_MATIC.addr, 
                signer.address)
            bal = ethers.utils.formatEther(bal.toString())
            console.log({oldBal: bal})
            if(bal.toString() < 0.1) {
                await lib.swapEthForTokens('1000000', lib.TOKENS.WETH_MATIC.addr, signer, signer.address, 
                lib.TOKENS.MATIC.addr, lib.ROUTERS.MATIC_MAINNET)
                let newBal = await lib.getTokenBalance(signer, lib.TOKENS.WETH_MATIC.addr, signer.address)
                console.log({newBal: ethers.utils.formatEther(newBal.toString())})
            }
        }
      })

      it('transfer balance2', async () => {
        let balance = await lib.getTokenBalance(owner, lib.TOKENS.WETH_MATIC.addr, nft.address)
        let balanceOwner = await lib.getTokenBalance(owner, lib.TOKENS.WETH_MATIC.addr, owner.address)
        console.log({balance, balanceOwner})
        let tx = nft.disburseWETHPayments([owner.address], [balance])
        await (await tx).wait()
        let balanceNew = await lib.getTokenBalance(owner, lib.TOKENS.WETH_MATIC.addr, nft.address)
        let balanceOwnerNew = await lib.getTokenBalance(owner, lib.TOKENS.WETH_MATIC.addr, owner.address)
        expect(balanceNew.toString()==0).to.equal(true)
        expect(balance.add(balanceOwner).eq(balanceOwnerNew)).to.equal(true)
    })
    
    it('set limits', async () => {
        let tx = await nft.setLimits(1, 2, 3, 4, 5, 10, 10, 10, 10, 10)
        await tx.wait()
    })
    
    it('set early merkle root', async () => {
        let tx = await nft.setEarlyAccessMerkleRoot(root)
        await tx.wait()
    })

    it('initialize a minting price for testing', async () => {
        let tx = await nft.setPhaseAndMintPrice(0, price)
        await tx.wait()
    })

    it('approve token', async () => {
        const signers = await ethers.getSigners()
        let price = ethers.utils.parseEther('5').toString()
        console.log('approve token', price)
        for(let i=0; i < 5; ++i) {
            let signer = signers[i]
            await lib.approveToken(lib.TOKENS.WETH_MATIC.addr, nft.address, price, signer)
            console.log('token approved', i)
        }
    })

    it('[LOCKED] mint with allowed user1', async () => {
        let hashedAddress = keccak256(addr1.address)
        let proof = merkleTree.getHexProof(hashedAddress)
        try {
            let tx = await nft.connect(addr1).mintEarlyAccessSale(proof, 1)
            await tx.wait()
        } catch(err: any) {
             return expect(err.message.includes('not in required phase')).to.equal(true)
        }
        throw new Error('mint should have failed, but didnt')
    })

    it('set phase to early access', async () => {
        let tx = await nft.setPhaseAndMintPrice(1, price)
        await tx.wait()
    })
    
    it('check token allownace', async () => {
        let price = ethers.utils.parseEther('5').toString()
        console.log('token allownace')
        let allownace = await lib.checkTokenAllowance(lib.TOKENS.WETH_MATIC.addr, nft.address, owner)
        expect(price==allownace.toString()).to.equal(true)
    })

    it('[PRESALE] mint with allowed user1 mint 1: should pass', async () => {
        let hashedAddress = keccak256(addr1.address)
        let proof = merkleTree.getHexProof(hashedAddress)
        let value = ethers.utils.parseEther('0.001').toString()
        let tx = await nft.connect(addr1).mintEarlyAccessSale(proof, 1)
        await tx.wait()

        let balance = await nft.earlyCounter(addr1.address)
        expect(balance.toString()).to.equal('1')
    })

    it('transfer balance', async () => {
        let balance = await lib.getTokenBalance(owner, lib.TOKENS.WETH_MATIC.addr, nft.address)
        let balanceOwner = await lib.getTokenBalance(owner, lib.TOKENS.WETH_MATIC.addr, owner.address)
        console.log({balance, balanceOwner})
        let tx = nft.disburseWETHPayments([owner.address], [balance])
        await (await tx).wait()
        let balanceNew = await lib.getTokenBalance(owner, lib.TOKENS.WETH_MATIC.addr, nft.address)
        let balanceOwnerNew = await lib.getTokenBalance(owner, lib.TOKENS.WETH_MATIC.addr, owner.address)
        expect(balanceNew.toString()==0).to.equal(true)
        expect(balance.add(balanceOwner).eq(balanceOwnerNew)).to.equal(true)
    })

    return;

    it('[PRESALE] mint with allowed user2 mint 2: should pass', async () => {
        let hashedAddress = keccak256(addr2.address)
        let proof = merkleTree.getHexProof(hashedAddress)
        let value = ethers.utils.parseEther('0.002').toString()
        let tx = await nft.connect(addr2).mintEarlyAccessSale(proof, 2)
        await tx.wait()
    })

    it('[PRESALE] mint with allowed user2 mint 2 more: should fail [limit breach]', async () => {
        let hashedAddress = keccak256(addr2.address)
        let proof = merkleTree.getHexProof(hashedAddress)
        try {
            let value = ethers.utils.parseEther('0.002').toString()
            let tx = await nft.connect(addr2).mintEarlyAccessSale(proof, 2)
            await tx.wait()
        } catch(err: any) {
            return expect(err.message.includes('exceeding limit per wallet')).to.equal(true)
        }
        throw new Error('mint should have failed, but didnt')
    })

    it('[PRESALE] mint with un-allowed user3 mint 1: should fail', async () => {
        let hashedAddress = keccak256(addr3.address)
        let proof = merkleTree.getHexProof(hashedAddress)
        try {
            let value = ethers.utils.parseEther('0.001').toString()
            let tx = await nft.connect(addr3).mintEarlyAccessSale(proof, 1)
            await tx.wait()
        } catch(err: any) {
            return expect(err.message.includes('Incorrect proof')).to.equal(true)
        }
        throw new Error('mint should have failed, but didnt')
    })

    it('set phase to public-sale', async () => {
        let value = ethers.utils.parseEther('0.005').toString()
        let tx = await nft.setPhaseAndMintPrice(4, value) 
        await tx.wait()
    })


    it('[PUBLICSALE] mint with un-allowed user3 mint 4: should fail [less fee given]', async () => {
        try {
            let pless = ethers.utils.parseEther('0.019')
            let newBal = await lib.getTokenBalance(addr3, lib.TOKENS.WETH_MATIC.addr, addr3.address)
            let balanceToSend = newBal.sub(pless)
            console.log(balanceToSend, newBal, pless)
            if(newBal.gte(pless)) {
                console.log('sending tx')
                await lib.sendToken(lib.TOKENS.WETH_MATIC.addr,
                    owner.address, balanceToSend.toString(), addr3)
            }
            newBal = await lib.getTokenBalance(addr3, lib.TOKENS.WETH_MATIC.addr, addr3.address)
            console.log({newBal})
            let tx2 = await nft.connect(addr3).mintTo(addr3.address, 4)
            await tx2.wait()
        } catch(err: any) {
            return expect(err.message.includes('Insufficient WETH')).to.equal(true)
        }
        throw new Error('mint should have failed, but didnt')
    })

    it('[PUBLICSALE] mint with un-allowed user3 mint 4: should pass', async () => {
        await lib.swapEthForTokens('1000000', lib.TOKENS.WETH_MATIC.addr, addr3, addr3.address, 
                lib.TOKENS.MATIC.addr, lib.ROUTERS.MATIC_MAINNET)
        let pless = ethers.utils.parseEther('0.02')
        let tx = await nft.connect(addr3).mintTo(addr3.address, 4)
        await tx.wait()
    })

    it('[PUBLICSALE] mint with un-allowed user4 mint 4: should fail [overall limit check]', async () => {
        try {
            let pless = ethers.utils.parseEther('0.04')
            let tx = await nft.connect(addr4).mintTo(addr4.address, 4)
            await tx.wait()
        } catch(err: any) {
            return expect(err.message.includes('Supply exceeding')).to.equal(true)
        }
        throw new Error('mint should have failed, but didnt')
    })

    it('[PUBLICSALE] mint with un-allowed user4 mint 8: should fail [wallet limit check]', async () => {
        try {
            let pless = ethers.utils.parseEther('0.04')
            let tx = await nft.connect(addr3).mintTo(addr3.address, 8)
            await tx.wait()
        } catch(err: any) {
            return expect(err.message.includes('exceeding max limit per wallet')).to.equal(true)
        }
        throw new Error('mint should have failed, but didnt')
    })

    
  });
});
