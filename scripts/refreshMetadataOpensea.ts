import fetch from "node-fetch";

// let API = 'https://api.opensea.io/api/v1/asset'
let API = 'https://testnets-api.opensea.io/api/v1/asset/mumbai'
async function main() {
    let fromTokenId = 0;
    let toTokenId = 8
    if(!process.env.NFT_CONTRACT)
        throw new Error('NFT_CONTRACT not defined')
    let contractAddress = process.env.NFT_CONTRACT
    for (let tokenId = fromTokenId; tokenId <= toTokenId; tokenId++) { 
        const url = `${API}/${contractAddress}/${tokenId}/?force_update=true`; 
        await fetch(url); 
        console.log(`Done with ${tokenId}`); 
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});