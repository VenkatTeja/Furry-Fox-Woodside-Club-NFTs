import { Button, Card, CardActions, CardContent, Container, Item, Grid, Paper, Input, Typography, Alert } from '@mui/material';
import { sampleNFT, web3 } from '@pages/utils/_web3';
import { useWeb3React } from '@web3-react/core';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Web3 from 'web3';
import styles from '../../styles/Home.module.css';

const MintNFTCard = ({title, description, action, canMint, showNumToMint, numToMint, setNumToMint, mintStatus, loading, mintPrice, imageUrl, ownedNFTs, maxLimit}) => {

    const { active, account, chainId } = useWeb3React();

    const [checking, setChecking] = useState(true);
    const [disabled, setDisabled] = useState(false);
    const [waiting, setWaiting] = useState(false)
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [shouldApprove, setShouldApprove] = useState(true);
    let WETH = null;
    
    const WETHContract = async () => {
      if(WETH)
        return WETH
      let tokenAddress = await sampleNFT.methods.WETH().call()
      console.log('tokenaddress', tokenAddress)
      const ERC20ABI = require("/data/ERC20.json");
      WETH = new web3.eth.Contract(ERC20ABI.abi, tokenAddress);
      return WETH
    }

    const handleChange = (event) => {
      const _numToMint = parseInt(event.target.value);
      setNumToMint(_numToMint);
    };

    const approveToken = async () => {
      try {
        setWaiting(true)
        await WETHContract()
        let allowance = web3.utils.toWei('10')
        let requiredAllowance = getRequiredAllowance()
        if(requiredAllowance.gte(web3.utils.toBN(allowance)))
          allowance = requiredAllowance.toString()
        console.log('approving token', allowance)
        await WETH.methods.approve(process.env.NEXT_PUBLIC_NFT_ADDRESS, allowance).send({ from: account })
        .on('transactionHash', function(hash) {
          console.log('transactionHash', hash)
        })
        .on('confirmation', function(confirmationNumber, receipt){
          if(confirmationNumber == 1 && receipt.status) {
            console.log('tx confirmation', confirmationNumber, receipt)
            setMessage('Token approved')
            setTimeout(()=>{
              setMessage('')
            }, 5000)
            setWaiting(false)
            checkTokenAllowance()
          }
        })
        .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
          console.log('tx error', error, error.message, receipt)
          setError('Transaction failed')
          setTimeout(()=>{
            setError('')
          }, 5000)
          setWaiting(false)
        });
      } catch (err) {
        console.error('approveToken err', err)
        setWaiting(false)
      }
    }

    const getRequiredAllowance = () => {
      console.log(mintPrice*1000000000, mintPrice)
        let requiredAllowance = web3.utils.toWei(web3.utils.toBN(parseInt(mintPrice*1000000000)), 'gwei').mul(web3.utils.toBN(numToMint))
          console.log('required allownace', requiredAllowance.toString(), title)
        return requiredAllowance
    }

    const checkTokenAllowance = async () => {
      try {
        setChecking(true)
        setError('')
        console.log('number to mint', numToMint)
        if(!numToMint || numToMint < 1) {
          setDisabled(true)
          setChecking(false)
          return setError('Quantity must be at least 1')
        }
        if(!Number.isInteger(numToMint)) {
          setDisabled(true)
          setChecking(false)
          return setError('Quantity must a integer')
        }
        // Check if token is already allowed
        await WETHContract()
        let allowance = await WETH.methods.allowance(account, process.env.NEXT_PUBLIC_NFT_ADDRESS).call()
        console.log('allowance', {allowance, mintPrice, numToMint, bn: web3.utils.toWei(mintPrice+'')})
        let requiredAllowance = getRequiredAllowance()
        if(requiredAllowance.lte(web3.utils.toBN(allowance)))
          setShouldApprove(false)
        else
          setShouldApprove(true)
        setChecking(false)
        setDisabled(false)
        // let inWei = ethers.utils.parseUnits(this.betAmount.toString(), this.globalService.TokenDecimals)
        // let weiToEther = ethers.utils.formatUnits(inWei, this.globalService.TokenDecimals)
        // console.log({ betAmount: this.betAmount.toString(), inWei: inWei.toString(), weiToEther, allownace: allowance[0].toNumber() })
        // if (allowance.length > 0 && allowance[0].gte(inWei)) {
        //   this.isTokenAllowed = true;
        //   console.log('token allowed')
        // } else {
        //   this.isTokenAllowed = false
        // }
        // this.loader.loaderEnd()
      } catch (err) {
        console.error(err)
        setError('Something went wrong while checking wETH allowance')
        setChecking(false)
        setDisabled(true)
      }
    }

    useEffect(()=> {
      checkTokenAllowance()
    }, [account, numToMint, mintPrice])

  return (
    <>
    <Paper
      className=""
      sx={{
        p: 2,
        flexGrow: 1,
        backgroundColor:'#171717'
      }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
            <Image alt="sample NFT" src={imageUrl} layout="responsive" width={'100vw'} height={'100%'}/>
        </Grid>
        
        <Grid item xs={12} sm container>
          <Grid item xs container direction="column" spacing={2}>
            <Grid item xs>
              <Typography variant="h5" sx={{ fontSize: 14, color: "text.primary", marginBottom: '10px', fontFamily: 'IntegralCF' }}>
                {title}
              </Typography>
              
              <Typography variant="body1" color="text.secondary">
                {mintStatus ? "Success! Check your wallet in a few minutes."
                  : description}
              </Typography>
              <Typography variant="body1" color="text.secondary"
                sx={{marginTop: '20px'}}>
                This wallet owns {ownedNFTs} NFTs
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {maxLimit} NFTs are allowed per wallet
              </Typography>
            </Grid>
            <Grid item>
              <CardActions>
                {showNumToMint &&
                  <Input onChange={handleChange} defaultValue={numToMint} type="number" placeholder="Quantity to mint"
                    sx={{mx: 3, marginLeft: 0}}
                  />}
                {(loading || checking) ? ("Loading...") : (
                  <>
                    {shouldApprove &&   
                    <Button disabled={!canMint || waiting || disabled} onClick={approveToken} variant="contained">Approve wETH</Button>}
                    {!shouldApprove && 
                    <Button disabled={!canMint || waiting || disabled} onClick={action} variant="contained">Mint</Button>}
                  </>
                )}
              </CardActions>
            </Grid>
          </Grid>
          <Grid item>
            <Typography variant="h6" component="div">
              {mintPrice} wETH
            </Typography>
          </Grid>
        </Grid>
            
            
      </Grid>
      
    </Paper>
    {error && <Alert variant='filled' severity="warning" onClose={() => {setError('')}}>{error}</Alert>}
    {waiting && <Alert variant='filled' severity="info">Waiting for transaction to complete</Alert>}
    {message && <Alert variant='filled' severity="success" onClose={() => {setMessage('')}}>{message}</Alert>}
    </>
  );
}

export default MintNFTCard;