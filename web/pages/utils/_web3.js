
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { useEffect, useState } from "react";
import Web3 from 'web3';

console.log('loaded web3')
/** Do not destructure env variables */
const INFURA_ID =  process.env.NEXT_PUBLIC_INFURA_ID;
const NFT_ADDRESS = '0xC89d0B0F98d446E13F7A3f568d28B81AB5c1f55D';//process.env.NEXT_PUBLIC_NFT_ADDRESS;
const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT;

const web3 = new Web3(Web3.givenProvider)
const contractABI = require("/data/SampleNFT.json");

console.log({provider: Web3.givenProvider})
web3.eth.net.getId()
.then(console.log);
const acceptedChains = ENVIRONMENT === 'development' ? [4, 1337] : [1];

export const sampleNFT = new web3.eth.Contract(contractABI.abi, NFT_ADDRESS);
export const explorer = ENVIRONMENT === 'development' ? 'https://rinkeby.etherscan.io/tx/' : 'https://etherscan.io/tx/'

export const injected = new InjectedConnector({ supportedChainIds: acceptedChains, });
export const walletConnect = new WalletConnectConnector({
  infuraId: INFURA_ID,
  supportedChainIds: acceptedChains,
});

export const walletlink = new WalletLinkConnector({
  appName: 'NFT Minting Scaffold',
  supportedChainIds: acceptedChains,
})

export const mintWithProof = async (account, proof, method, qty) => {
  return new Promise((resolve, reject) => {
    console.log('minting...', account, method);
    sampleNFT.methods[method](proof, qty).send({ from: account })
    .on('transactionHash', function(hash){
      console.log('transactionHash', hash)
    })
    .on('confirmation', function(confirmationNumber, receipt){
      if(confirmationNumber == 1 && receipt.status) {
        console.log('tx confirmation', confirmationNumber, receipt)
        resolve({
          success: true,
          status: `✅ Check out your transaction on Etherscan`,
          url: `${explorer}${receipt.transactionHash}`
        });
      }
    })
    .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      console.log('tx error', error, error.message, receipt)
      if(receipt)
        resolve({
          success: false,
          status: "😥 Something went wrong: " + error.message,
          url: `${explorer}${receipt.transactionHash}`
        })
      else 
        resolve({
          success: false,
          status: null,
          url: null
        })
    });
  })
};

export const mintGift = async (account, proof) => {
  console.log('minting gift...');
  const result = sampleNFT.methods.mintGift(proof).send({ from: account }).then((result) => {
      return {
        success: true,
        status: `✅ Check out your transaction on Etherscan: https://etherscan.io/tx/` + result
        };
  }).catch((err) => {
    return {
      success: false,
      status: "😥 Something went wrong: " + err.message
      }
  });
  return result;
};

export const mintWhitelist = async (account, proof) => {
  console.log('minting whitelist...');
  const amount = '0.01';
    const amountToWei = web3.utils.toWei(amount, 'ether');
  const result = sampleNFT.methods.mintWhitelist(proof).send({ from: account, value: amountToWei }).then((result) => {
    console.log(`✅ Check out your transaction on Etherscan: https://etherscan.io/tx/` + result);
      return {
        success: true,
        status: `✅ Check out your transaction on Etherscan: https://etherscan.io/tx/` + result
        };
  }).catch((err) => {
    console.log("Mint transaction failed!");
    return {
      success: false,
      status: "😥 Something went wrong: " + err.message
      }
  }).finally((result) => {
    return result;
  });
  return result;
}

  export const mintPublic = async (account, numberOfTokens) => {
    console.log('minting publicMint...');
    const amount = (numberOfTokens * 0.02).toString();
    const amountToWei = web3.utils.toWei(amount, 'ether');
    const result = sampleNFT.methods.publicMint(numberOfTokens).send({ from: account, value: amountToWei }).then((result) => {
      console.log(`✅ Check out your transaction on Etherscan: https://etherscan.io/tx/` + result);
        return {
          success: true,
          status: `✅ Check out your transaction on Etherscan: https://etherscan.io/tx/` + result
          };
    }).catch((err) => {
      console.log("Mint transaction failed!");
      return {
        success: false,
        status: "😥 Something went wrong: " + err.message
        }
    });
    return result;
};

export function abridgeAddress(hex, length = 4) {
  return `${hex.substring(0, length + 2)}…${hex.substring(
    hex.length - length
  )}`;
}

export const useENSName = (library, address) => {
  const [ENSName, setENSName] = useState("");
  useEffect(() => {
    if (library && typeof address === "string") {
      let stale = false;

      library
        .lookupAddress(address)
        .then((name) => {
          if (!stale && typeof name === "string") {
            setENSName(name);
          }
        })
        .catch(() => {});

      return () => {
        stale = true;
        setENSName("");
      };
    }
  }, [library, address]);

  return ENSName;
}

export default function blank() { return <></>}
