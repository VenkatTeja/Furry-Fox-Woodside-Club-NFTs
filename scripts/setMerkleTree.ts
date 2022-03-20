
import { ethers } from "hardhat";
import teamList from '../web/data/teamlist.json'
const keccak256 = require('keccak256')
const { MerkleTree } = require('merkletreejs')

async function main() {
    const result = await ethers.getSigners();
    let user = result[0]
    console.log(user.address)

    let nftAddress = '0xA295E086c0543959575dD27c824401bC4C38253A'
    const nft = await ethers.getContractAt("FFWClubNFT", nftAddress);

    console.log("NFT deployed to:", nft.address);

    // set team merkle tree root
    let whitelistLeaves = teamList
    whitelistLeaves = whitelistLeaves.map(addr => keccak256(addr))
    let merkleTree = new MerkleTree(whitelistLeaves, keccak256, {sortPairs: true})
    let root = merkleTree.getHexRoot()
    const tx = await nft.setTeamMerkleRoot(root)
    await tx.wait()

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});