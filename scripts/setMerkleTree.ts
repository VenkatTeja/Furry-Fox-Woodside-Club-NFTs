require('dotenv').config()
import { ethers } from "hardhat";
import earlylist from '../web/data/earlylist.json'
import viplist from '../web/data/viplist.json'
import whitelist from '../web/data/whitelist.json'
const keccak256 = require('keccak256')
const { MerkleTree } = require('merkletreejs')

async function main() {
    const result = await ethers.getSigners();
    let user = result[0]
    console.log(user.address)

    if(!process.env.NFT_CONTRACT)
        throw new Error('NFT_CONTRACT not defined')
    let nftAddress = process.env.NFT_CONTRACT
    const nft = await ethers.getContractAt("FFWClubNFT", nftAddress);

    console.log("NFT deployed to:", nft.address);

    // set team merkle tree root
    let whitelistLeaves = earlylist
    whitelistLeaves = whitelistLeaves.map(addr => keccak256(addr))
    let merkleTree = new MerkleTree(whitelistLeaves, keccak256, {sortPairs: true})
    let root = merkleTree.getHexRoot()
    let tx = await nft.setEarlyAccessMerkleRoot(root)
    await tx.wait()
    console.log('Early root set', root)

    whitelistLeaves = viplist
    whitelistLeaves = whitelistLeaves.map(addr => keccak256(addr))
    merkleTree = new MerkleTree(whitelistLeaves, keccak256, {sortPairs: true})
    root = merkleTree.getHexRoot()
    tx = await nft.setVIPAccessMerkleRoot(root)
    await tx.wait()
    console.log('VIP root set', root)

    whitelistLeaves = whitelist
    whitelistLeaves = whitelistLeaves.map(addr => keccak256(addr))
    merkleTree = new MerkleTree(whitelistLeaves, keccak256, {sortPairs: true})
    root = merkleTree.getHexRoot()
    tx = await nft.setWhitelistMerkleRoot(root)
    await tx.wait()
    console.log('Pre-sale root set', root)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});