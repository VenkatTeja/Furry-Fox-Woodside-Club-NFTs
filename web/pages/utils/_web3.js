
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { useEffect, useState } from "react";
import Web3 from 'web3';
var mixpanel = require('mixpanel-browser');

console.log('loaded web3')
/** Do not destructure env variables */
const INFURA_ID =  process.env.NEXT_PUBLIC_INFURA_ID;
const NFT_ADDRESS = process.env.NEXT_PUBLIC_NFT_ADDRESS;
const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT;
const SUPPORTED_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_ACCEPTED_CHAIN_ID)
let host = process.env.NEXT_PUBLIC_HOST
let providerRPC = `${host}/rpc`
console.log('givenProvider', Web3.givenProvider)
export let web3 = new Web3(new Web3.providers.HttpProvider(providerRPC))
const contractABI = require("/data/SampleNFT.json");

export let providerReady = false
const acceptedChains = [SUPPORTED_CHAIN_ID]

export let sampleNFT = new web3.eth.Contract(contractABI.abi, NFT_ADDRESS);
export const explorer = ENVIRONMENT === 'development' ? 'https://mumbai.polygonscan.com/tx/' : 'https://polygonscan.com/tx/'

export const injected = new InjectedConnector({});
let rpcObj = {}
rpcObj[SUPPORTED_CHAIN_ID] = providerRPC
console.log('host', providerRPC)
export const walletConnect = new WalletConnectConnector({
  // infuraId: INFURA_ID,
  rpc: rpcObj,
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  chainId: SUPPORTED_CHAIN_ID,
  pollingInterval: 10000,
  supportedChainIds: acceptedChains,
});

export let refreshWalletConnectProvider = async () => {
  let provider = await walletConnect.getProvider()
  // provider.rpcUrl = providerRPC
  console.log('provider', provider)
  web3 = new Web3(provider)
  sampleNFT = new web3.eth.Contract(contractABI.abi, NFT_ADDRESS);
  providerReady = true
}

export let refreshMetamaskProvider = async () => {
  web3 = new Web3(Web3.givenProvider)
  sampleNFT = new web3.eth.Contract(contractABI.abi, NFT_ADDRESS);
  providerReady = true
}

let WETH = null;
const WETHContract = async () => {
  console.log('WETHContract', web3)
  if(WETH)
    return WETH
  let tokenAddress = await sampleNFT.methods.WETH().call()
  console.log('tokenaddress', tokenAddress)
  const ERC20ABI = require("/data/ERC20.json");
  WETH = new web3.eth.Contract(ERC20ABI.abi, tokenAddress);
  return WETH
}

export const fetchBalance = async (account) => {
  await WETHContract()
  let balance = await WETH.methods.balanceOf(account).call()
  let balEther = web3.utils.fromWei(balance)
  return balEther;
}

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
  console.log('parseWeb3Error', err, err.message)
  const startIndex = JSON.stringify(err.message).search('{')
  if(startIndex > 0) {
    const endIndex = JSON.stringify(err.message).search('}')
    let errorJson = JSON.stringify(err.message).substring(startIndex, endIndex+1).split('\\n').join('').split('\\').join('')
    console.warn(errorJson)
    errorJson = JSON.parse(errorJson)
    return errorJson
  } else {
    console.log('is error type 2')
    return {message: err.message}
  }
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

mixpanel.init("581b979affe3b2c9b88a2dfccc5f14a6");

export const track = (name, props = {}) => {
  mixpanel.track(name, props);
}

export default function blank() { return <></>}
