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

  const [teamClaimable, setTeamClaimable] = useState(NOT_CLAIMABLE);
  const [teamNumToMint, setTeamNumToMint] = useState(1);
  const [teamMintStatus, setTeamMintStatus] = useState();

  const [giftClaimable, setGiftClaimable] = useState(NOT_CLAIMABLE);
  const [whitelistClaimable, setWhitelistClaimable] = useState(NOT_CLAIMABLE);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);

  const [giftMintStatus, setGiftMintStatus] = useState();
  const [whitelistMintStatus, setWhitelistMintStatus] = useState();
  const [publicMintStatus, setPublicMintStatus] = useState();

  const [numToMint, setNumToMint] = useState(2);

  useEffect(() => {
    if (!active || !account) {
      setAlreadyClaimed(false);
      return;
    }
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

  

  let giftProof = [];
  let giftValid = false;
  const giftRes = useSWR(active && account ? `/api/giftProof?address=${account}` : null, {
    fetcher, revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false });
  if (!giftRes.error && giftRes.data) {
    const { proof, valid } = giftRes.data;
    giftProof = proof;
    giftValid = valid;
  }

  useEffect(() => {
    if (!active || !giftValid) {
      setGiftClaimable(NOT_CLAIMABLE);
      return;
    } else if (alreadyClaimed) {
      setGiftClaimable(ALREADY_CLAIMED);
      return;
    }
    async function validateClaim() {
      sampleNFT.methods.mintGift(giftProof).call({ from: account }).then(() => {
        setGiftClaimable(CLAIMABLE);
      }).catch((err) => {
        if (err.toString().includes('claimed')) { setGiftClaimable(ALREADY_CLAIMED)}
        else { setGiftClaimable(NOT_CLAIMABLE) }
      });
    }
    validateClaim();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [giftProof])

  let whitelistProof = [];
  let whitelistValid = false;
  const whitelistRes = useSWR(active && account ? `/api/whitelistProof?address=${account}` : null, {
    fetcher, revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false });
  if (!whitelistRes.error && whitelistRes.data) {
    const { proof, valid } = whitelistRes.data;
    whitelistProof = proof;
    whitelistValid = valid;
  }

  useEffect(() => {
    if (!active || !whitelistValid) {
      setWhitelistClaimable(NOT_CLAIMABLE);
      return;
    } else if (alreadyClaimed) {
      setWhitelistClaimable(ALREADY_CLAIMED);
      return;
    }
    async function validateClaim() {
      const amount = '0.01';
      const amountToWei = web3.utils.toWei(amount, 'ether');
      sampleNFT.methods.mintWhitelist(whitelistProof).call({ from: account, value: amountToWei }).then(() => {
        setWhitelistClaimable(CLAIMABLE);
      }).catch((err) => {
        if (err.toString().includes('claimed')) { setWhitelistClaimable(ALREADY_CLAIMED)}
        else { setWhitelistClaimable(NOT_CLAIMABLE) }
      });
    }
    validateClaim();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whitelistProof])


  const onMintTeam = async () => {
    const { success, status } = await mintWithProof(account, giftProof, 'mintToTeam', teamNumToMint);
    console.log(status);
    setTeamMintStatus(success);
  };

  const onMintGift = async () => {
    const { success, status } = await mintGift(account, giftProof);
    console.log(status);
    setGiftMintStatus(success);
  };

  const onMintWhitelist = async () => {
    const { success, status } = await mintWhitelist(account, whitelistProof);
    console.log(status);
    setWhitelistMintStatus(success);
  };

  const onPublicMint = async () => {
    const { success, status } = await mintPublic(account, numToMint);
    console.log(status);
    setPublicMintStatus(success);
  };

  return (
    <>
      <Stack id="demo" sx={{bgColor: 'secondary.main'}}>
        <Typography variant="h4" color='primary.main' sx={{textAlign: 'center', paddingTop: 5, paddingBottom: 5, fontFamily: 'IntegralCF'}}>Mint an NFT</Typography>
        <Grid container spacing={3} justifyContent="center" alignItems="center">
        <MerkleMintComponent
            title={'Early Access Mint'}
            description={'Mint this NFT to the connected wallet. Must be on team whitelist.'}
            mintMethod="mintToTeam"
            counterMethod="teamCounter"
            maxLimitMethod="MAX_PER_TEAM_ADDRESS"
            api="teamProof"
            imageUrl={'/nfts/01.png'}
            mintPrice={0.04}
         ></MerkleMintComponent>
         <MerkleMintComponent
            title={'VIP Access Mint'}
            description={'Mint this NFT to the connected wallet. Must be on team whitelist.'}
            mintMethod="mintToTeam"
            counterMethod="teamCounter"
            maxLimitMethod="MAX_PER_TEAM_ADDRESS"
            api="teamProof"
            imageUrl={'/nfts/02.png'}
            mintPrice={0.05}
         ></MerkleMintComponent>
         <MerkleMintComponent
            title={'Pre-Sale Mint'}
            description={'Mint this NFT to the connected wallet. Must be on team whitelist.'}
            mintMethod="mintToTeam"
            counterMethod="teamCounter"
            maxLimitMethod="MAX_PER_TEAM_ADDRESS"
            api="teamProof"
            imageUrl={'/nfts/03.png'}
            mintPrice={0.06}
         ></MerkleMintComponent>
         <MerkleMintComponent
            title={'Airdrop Mint'}
            description={'Mint this NFT to the connected wallet. Must be on team whitelist.'}
            mintMethod="mintToTeam"
            counterMethod="teamCounter"
            maxLimitMethod="MAX_PER_TEAM_ADDRESS"
            api="teamProof"
            imageUrl={'/nfts/01.png'}
            mintPrice={0}
         ></MerkleMintComponent>
         
         <Grid item>
            <MintNFTCard
              title={'Public Mint'}
              description={'Mint this NFT to the connected wallet. Open for any wallet to mint. Cost: 0.02 ETH'}
              canMint={active}
              mintStatus={publicMintStatus}
              showNumToMint={true}
              setNumToMint={setNumToMint}
              action={onPublicMint}
            imageUrl={'/nfts/02.png'}
            mintPrice={0.12}
            />
          </Grid>
        </Grid>
      </Stack>
    </>
  );
}

export default MintNFT;