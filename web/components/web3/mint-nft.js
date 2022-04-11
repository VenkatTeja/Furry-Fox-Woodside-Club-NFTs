import { Grid, Stack, Typography  } from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { mintGift, mintWithProof, mintPublic, mintWhitelist, sampleNFT } from '@pages/utils/_web3';
import MintNFTCard from './mint-nft-card';
import MerkleMintComponent from './merkle-mint-component'
import useSWR from 'swr';
import Web3 from 'web3';

const NOT_CLAIMABLE = 0;
const ALREADY_CLAIMED = 1;
const CLAIMABLE = 2;

const MintNFT = () => {
  const web3 = new Web3(Web3.givenProvider)

  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { active, account, chainId } = useWeb3React();

  const [phase, setPhase] = useState(-1)
  const [mintPrice, setMintPrice] = useState(0)

  const [teamClaimable, setTeamClaimable] = useState(NOT_CLAIMABLE);
  const [teamNumToMint, setTeamNumToMint] = useState(1);
  const [teamMintStatus, setTeamMintStatus] = useState();

  const [giftClaimable, setGiftClaimable] = useState(NOT_CLAIMABLE);
  const [whitelistClaimable, setWhitelistClaimable] = useState(NOT_CLAIMABLE);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);

  const [giftMintStatus, setGiftMintStatus] = useState();
  const [whitelistMintStatus, setWhitelistMintStatus] = useState();
  const [publicMintStatus, setPublicMintStatus] = useState();

  const [numToMint, setNumToMint] = useState(1);

  useEffect(() => {
    if (!active || !account || chainId !=process.env.NEXT_PUBLIC_ACCEPTED_CHAIN_ID) {
      setAlreadyClaimed(false);
      return;
    }

    async function getPhase() {
      let _phase = await sampleNFT.methods.phase().call({ from: account })
      console.log('current phase', _phase)
      setPhase(_phase)
    }
    getPhase()

    async function getMintPrice() {
      let _mintPrice = await sampleNFT.methods.mintPrice().call({ from: account })
      console.log('mintPrice', _mintPrice)
      setMintPrice(web3.utils.fromWei(_mintPrice))
    }
    getMintPrice()
    // async function checkIfClaimed() {
    //   sampleNFT.methods.claimed(account).call({ from: account }).then((result) => {
    //     setAlreadyClaimed(result);
    //   }).catch((err) => {
    //     setAlreadyClaimed(false);
    //   });
    // }
    // checkIfClaimed();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  

  // const onMintTeam = async () => {
  //   const { success, status } = await mintWithProof(account, giftProof, 'mintToTeam', teamNumToMint);
  //   console.log(status);
  //   setTeamMintStatus(success);
  // };

  // const onMintGift = async () => {
  //   const { success, status } = await mintGift(account, giftProof);
  //   console.log(status);
  //   setGiftMintStatus(success);
  // };

  // const onMintWhitelist = async () => {
  //   const { success, status } = await mintWhitelist(account, whitelistProof);
  //   console.log(status);
  //   setWhitelistMintStatus(success);
  // };

  const onPublicMint = async () => {
    const { success, status } = await mintPublic(account, numToMint);
    console.log(status);
    setPublicMintStatus(success);
  };

  return (
    <>
      <Stack id="demo" sx={{bgColor: 'secondary.main', width: '100%'}}>
        <Typography variant="h4" color='primary.main' sx={{textAlign: 'center', paddingTop: 5, paddingBottom: 5, fontFamily: 'IntegralCF'}}>Mint an NFT</Typography>
        {phase==0 && <Typography variant="body1" color='primary.main' sx={{textAlign: 'center', paddingTop: 5, paddingBottom: 5, fontFamily: 'IntegralCF'}}>Sale is not open yet</Typography>}
        <Grid container spacing={3} justifyContent="center" alignItems="center">
        {phase==1 && <MerkleMintComponent
            title={'Early Access Mint'}
            description={'Mint this NFT to the connected wallet. Must be on Early access whitelist.'}
            mintMethod="mintEarlyAccessSale"
            counterMethod="earlyCounter"
            maxLimitMethod="MAX_PER_EARLY_ADDRESS"
            api="earlyAccess"
            imageUrl={'/nfts/01.png'}
            mintPrice={mintPrice}
         ></MerkleMintComponent>}
         {phase==2 && <MerkleMintComponent
            title={'VIP Access Mint'}
            description={'Mint this NFT to the connected wallet. Must be on VIP whitelist.'}
            mintMethod="mintVIPAccessSale"
            counterMethod="vipCounter"
            maxLimitMethod="MAX_PER_VIP_ADDRESS"
            api="VIPAccess"
            imageUrl={'/nfts/02.png'}
            mintPrice={mintPrice}
         ></MerkleMintComponent>}
         {phase==3 && <MerkleMintComponent
            title={'Pre-Sale Mint'}
            description={'Mint this NFT to the connected wallet. Must be on Pre-sale whitelist.'}
            mintMethod="mintPresale"
            counterMethod="presaleCounter"
            maxLimitMethod="MAX_PER_PRESALE_ADDRESS"
            api="whitelistAccess"
            imageUrl={'/nfts/03.png'}
            mintPrice={mintPrice}
         ></MerkleMintComponent>}
         {/* <MerkleMintComponent
            title={'Airdrop Mint'}
            description={'Mint this NFT to the connected wallet. Must be on team whitelist.'}
            mintMethod="mintToTeam"
            counterMethod="teamCounter"
            maxLimitMethod="MAX_PER_TEAM_ADDRESS"
            api="whitelistAccess"
            imageUrl={'/nfts/01.png'}
            mintPrice={0}
         ></MerkleMintComponent> */}
         
         {phase==4 && 
            <MerkleMintComponent
              title={'Public Mint'}
              description={'Mint this NFT to the connected wallet. Open for any wallet to mint.'}
              mintMethod="mintTo"
              counterMethod="publicsaleCounter"
              maxLimitMethod="MAX_PER_PUBLICSALE_ADDRESS"
              api="publicAccess"
              imageUrl={'/nfts/02.png'}
              mintPrice={mintPrice}
            />}
        </Grid>
      </Stack>
    </>
  );
}

export default MintNFT;