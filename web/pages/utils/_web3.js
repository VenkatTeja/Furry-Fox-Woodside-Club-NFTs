
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { useEffect, useState } from "react";
import Web3 from 'web3';

console.log('loaded web3')
/** Do not destructure env variables */
const INFURA_ID =  process.env.NEXT_PUBLIC_INFURA_ID;
const NFT_ADDRESS = process.env.NEXT_PUBLIC_NFT_ADDRESS;
const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT;

const web3 = new Web3(Web3.givenProvider)
const contractABI = require("/data/SampleNFT.json");

console.log({provider: Web3.givenProvider})
web3.eth.net.getId()
.then(console.log);
const acceptedChains = ENVIRONMENT === 'development' ? [4, 1337, 80001] : [1, 137];

export const sampleNFT = new web3.eth.Contract(contractABI.abi, NFT_ADDRESS);
export const explorer = ENVIRONMENT === 'development' ? 'https://mumbai.polygonscan.com/tx/' : 'https://polygonscan.com/tx/'

export const injected = new InjectedConnector({});
export const walletConnect = new WalletConnectConnector({
  infuraId: INFURA_ID,
  // supportedChainIds: acceptedChains,
});

export function activateInjectedProvider(providerName) {
  /*
    providerName: 'MetaMask' | 'CoinBase'
  */
  const { ethereum } = window;

  if (!ethereum?.providers) {
      return undefined;
  }

  let provider;
  switch (providerName) {
      case 'CoinBase':
          provider = ethereum.providers.find(({ isCoinbaseWallet }) => isCoinbaseWallet);
          break;
      case 'MetaMask':
          provider = ethereum.providers.find(({ isMetaMask }) => isMetaMask);
          break;
  }

  if (provider) {
      ethereum.setSelectedProvider(provider);
  }
}

// export const walletlink = new WalletLinkConnector({
//   appName: 'NFT Minting Scaffold',
//   supportedChainIds: acceptedChains,
// })

export const parseWeb3Error = (err) => {
  const startIndex = JSON.stringify(err.message).search('{')
  const endIndex = JSON.stringify(err.message).search('}')
  let errorJson = JSON.stringify(err.message).substring(startIndex, endIndex+1).split('\\n').join('').split('\\').join('')
  console.warn(errorJson)
  errorJson = JSON.parse(errorJson)
  return errorJson
}

export const mintWithProof = async (account, proof, method, qty) => {
  return new Promise(async (resolve, reject) => {
    console.log('minting...', account, method);
    web3.eth.handleRevert = true
    try {
      let gas = await sampleNFT.methods[method](proof, qty).estimateGas({from: account})
    } catch(err) {
      console.error('minting will fail', err.message)
      let errorJson = parseWeb3Error(err)
      resolve({
        success: false,
        status: `${errorJson.message}`,
        url: null
      })
      return;
    }
    sampleNFT.methods[method](proof, qty).send({ from: account })
    .on('transactionHash', function(hash) {
      console.log('transactionHash', hash)
    })
    .on('confirmation', function(confirmationNumber, receipt){
      if(confirmationNumber == 1 && receipt.status) {
        console.log('tx confirmation', confirmationNumber, receipt)
        resolve({
          success: true,
          status: `Check out your transaction`,
          url: `${explorer}${receipt.transactionHash}`
        });
      }
    })
    .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      console.log('tx error', error, error.message, receipt)
      if(receipt)
        resolve({
          success: false,
          status: "Something went wrong: " + error.message,
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

export const mintPublic = async (account, numberOfTokens) => {
  return new Promise(async (resolve, reject) => {
    console.log('minting publicMint...');
    try {
      let gas = await sampleNFT.methods.mintTo(account, numberOfTokens).estimateGas({from: account})
    } catch(err) {
      console.error('public minting will fail', err.message)
      let errorJson = parseWeb3Error(err)
      resolve({
        success: false,
        status: `${errorJson.message}`,
        url: null
      })
      return;
    }

    sampleNFT.methods.mintTo(account, numberOfTokens).send({ from: account })
    .on('transactionHash', function(hash) {
      console.log('transactionHash', hash)
    })
    .on('confirmation', function(confirmationNumber, receipt){
      if(confirmationNumber == 1 && receipt.status) {
        console.log('tx confirmation', confirmationNumber, receipt)
        resolve({
          success: true,
          status: `Check out your transaction`,
          url: `${explorer}${receipt.transactionHash}`
        });
      }
    })
    .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      console.log('tx error', error, error.message, receipt)
      if(receipt)
        resolve({
          success: false,
          status: "Something went wrong: " + error.message,
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
