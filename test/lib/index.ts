import Web3 from 'web3';
import * as routerABI from '../abis/router.abi.json';
import * as ERC20ABI from '../abis/erc20.abi.json';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import BN = require('bn.js');
import { Unit } from 'web3/utils';
import { BigNumber } from 'ethers';
import { ethers } from "hardhat";

export let ROUTERS = {
    MATIC_MAINNET: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
    ETH_MAINNET: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
}

export async function swapEthForTokens(ethAmountMillis: string, tokenAddress: string, account: SignerWithAddress, toAddr = account.address, ethAddr=TOKENS.MATIC.addr, routerAddr = ROUTERS.MATIC_MAINNET) {
    let matic = ethAddr;//"0x5B67676a984807a212b1c59eBFc9B3568a474F0a"
    let abi: any = routerABI.abi;
    let router = new ethers.Contract(routerAddr, abi, account)
    let ethAmount = ethers.utils.parseUnits(ethAmountMillis, 15).toString()
    console.log({ethAmount})
    let tx = await router.swapExactETHForTokens(
        ethers.utils.hexValue(0),
        [matic, tokenAddress],
        toAddr,
        ethers.utils.hexValue(Math.round(Date.now()/1000)+60*20),
        {value: ethAmount}
    );
    await tx.wait()

    // var count = await ethers.provider.getTransactionCount(account.address);
    // var rawTransaction = {
    //     "from":account.address,
    //     "gasPrice":ethers.utils.hexValue(5000000000),
    //     "gasLimit":ethers.utils.hexValue(290000),
    //     "to":routerAddr,
    //     "value":ethers.utils.hexValue(ethAmount),
    //     "data":data.encodeABI(),
    //     "nonce": count
    // };
    // let tx = await account.sendTransaction(rawTransaction);
    // await tx.wait(2)
}

export async function getTokenBalance(signer: SignerWithAddress, tokenAddr: string, accountAddr: string) {
    let abi: any = ERC20ABI.abi;
    let token = new ethers.Contract(tokenAddr, abi, signer)
    let bal = await token.callStatic.balanceOf(accountAddr)
    return bal;
}

export async function approveToken(tokenAddr: string, spenderAddr: string, amount: string, account: SignerWithAddress) {
    let abi: any = ERC20ABI.abi;
    let token = new ethers.Contract(tokenAddr, abi, account)
    let tx = await token.approve(
        spenderAddr,
        amount
    );
    await tx.wait()
}

export async function sendToken(tokenAddr: string, toAddr: string, amount: string, account: SignerWithAddress) {
    let abi: any = ERC20ABI.abi;
    let token = new ethers.Contract(tokenAddr, abi, account)
    let tx = await token.transfer(
        toAddr,
        amount
    );
    await tx.wait()
}

export async function checkTokenAllowance(tokenAddr: string, spenderAddr: string, account: SignerWithAddress) {
    let abi: any = ERC20ABI.abi;
    let token = new ethers.Contract(tokenAddr, abi, account)
    return await token.allowance(
        account.address,
        spenderAddr,
    );
}

export const TOKENS = {
    USDT: {
        addr: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        decimals: 6
    },
    DAI: {
        addr: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
        decimals: 18
    },
    USDT_TESTNET: {
        addr: '0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832',
        decimals: 6
    },
    USDC_TESTNET: {
        addr: '0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e',
        decimals: 6
    },
    MATIC_TESTNET: {
        addr: '0x5B67676a984807a212b1c59eBFc9B3568a474F0a',
        decimals: 18
    },
    MATIC: {
        addr: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        decimals: 18
    },
    DAI_TESTNET: {
        addr: '0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F',
        decimals: 18
    },
    ETH_MAINNET: {
        addr: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        decimals: 18
    },
    WETH_MATIC: {
        addr: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        decimals: 18
    },
    WETH_MATIC_TESTNET: {
        addr: '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa',
        decimals: 18
    }
}
