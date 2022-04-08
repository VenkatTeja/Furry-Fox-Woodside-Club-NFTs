import { Grid, Stack } from '@mui/material';
import { Button, Card, CardActions, Alert, CardContent, Input, Typography } from '@mui/material';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import styles from '../../styles/Home.module.css';
import MintNFTCard from './mint-nft-card';
import { mintWithProof, sampleNFT, parseWeb3Error, mintPublic } from '@pages/utils/_web3';

import { useWeb3React } from '@web3-react/core';
import Web3 from 'web3';


const MerkleMintComponent = ({title, description, mintMethod, counterMethod, maxLimitMethod, api,
    mintPrice, imageUrl}) => {
    const web3 = new Web3(Web3.givenProvider)
    const fetcher = (url) => {
        setLoading(true); 
        return fetch(url).then((res) => {
            setLoading(false);
            return res.json()
        });
    }
    const { active, account, chainId } = useWeb3React();

    const [loading, setLoading] = useState(true)
    const [claimable, setClaimable] = useState(false);
    const [numToMint, setNumToMint] = useState(1);
    const [mintStatus, setMintStatus] = useState();
    const [mintInfo, setMintInfo] = useState({})
    const [error, setError] = useState('');
    const [ownedNFTs, setOwnedNFTs] = useState(0)
    const [maxLimit, setMaxLimit] = useState(0)

    const isPublicMint = api=="publicAccess"
    // team 
    let mintProof = [];
    let isValid = false;
    console.log({account, active})
    const res = useSWR(active && account ? `/api/commonWhitelistProof?address=${account}&whitelistName=${api}` : null, {
        fetcher, revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false });
    console.log({data: res.data, err: res.error})
    if (!res.error && res.data) {
        const { proof, valid } = res.data;
        mintProof = proof;
        isValid = valid;
    }

    const getMintStats = async () => {
        let result = await sampleNFT.methods[counterMethod](account).call({ from: account })
        let max = await sampleNFT.methods[maxLimitMethod]().call({from: account})
        console.log({result, max})
        setMaxLimit(parseInt(max))
        setOwnedNFTs(parseInt(result))

        return {mints: result, max: max}
    }

    useEffect(async () => {
        setLoading(true);
        setError('')
        console.log(`${title} checking`)
        if (!active || !isValid) {
            console.log(`${title} mint not allowed`, !active, !isValid)
            setClaimable(false);
            setLoading(false);
            setError('This wallet is not whitelisted for this NFT')
            return;
        } else {
            try {
                console.log({methods: sampleNFT.methods[counterMethod], counterMethod, maxLimitMethod, account})
                let {mints, max} = await getMintStats()
                let claimable = parseInt(mints) < parseInt(max)
                setClaimable(claimable);
                if(!claimable) {
                    setLoading(false);
                    setError('Max eligible mints for this wallet are done')
                    return;
                }
            } catch(err) {
                console.error(`fetch ${counterMethod} failed`, err)
                setClaimable(false)
                setError('Something went wrong while checking eligibility')
                setLoading(false);
                return;
            }
        }
        async function validateClaim() {
            sampleNFT.methods[mintMethod](mintProof, numToMint).call({ from: account }).then(() => {
                setLoading(false);
                setClaimable(true);
            }).catch((err) => {
                setLoading(false);
                console.warn('validateClaim err', err)
                setClaimable(false)
                let errorJson = parseWeb3Error(err)
                if(errorJson && errorJson.message) {
                    let allowanceMsg = 'transfer amount exceeds allowance'
                    let err = errorJson.message.replace('execution reverted: ', '')
                    console.log(err)
                    if(err.includes(allowanceMsg)) {
                        setClaimable(true)
                    } else {
                        setError(err)
                    }
                } else
                    setError('Validation failed')
            });
        }
        async function validatePublicMint() {
            sampleNFT.methods.mintTo(account, numToMint).call({ from: account }).then(() => {
                setLoading(false);
                setClaimable(true);
            }).catch((err) => {
                setLoading(false);
                console.warn('validateClaim err', err)
                setClaimable(false)
                let errorJson = parseWeb3Error(err)
                if(errorJson && errorJson.message) {
                    let allowanceMsg = 'transfer amount exceeds allowance'
                    let err = errorJson.message.replace('execution reverted: ', '')
                    console.log(err)
                    if(err.includes(allowanceMsg)) {
                        setClaimable(true)
                    } else {
                        setError(err)
                    }
                } else
                    setError('Validation failed')
            });   
        }
        !isPublicMint ? validateClaim() : validatePublicMint();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mintProof])

    const onMintWhitelist = async () => {
        setLoading(true)
        setMintInfo({status: null, success: null, url: null})
        const { success, status, url } = await mintWithProof(account, mintProof, mintMethod, numToMint);
        console.log({ success, status, url });
        setMintStatus(success);
        setMintInfo({status, success, url})
        setLoading(false)
        if(success)
            getMintStats()
    };

    const onMintPublic = async () => {
        setLoading(true)
        setMintInfo({status: null, success: null, url: null})
        const { success, status, url } = await mintPublic(account, numToMint);
        console.log({ success, status, url });
        setMintStatus(success);
        setMintInfo({status, success, url})
        setLoading(false)
        if(success)
            getMintStats()
    };

    const resetMintInfo = async () => {
        setMintInfo({status: null, success: null, url: null})
    }
    return (
        <>
            <Grid item className={styles.mintContainer}>
                {(loading && 0) ? (
                    <Card sx={{  width: 600 }}>
                        <CardContent>
                            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                loading...
                            </Typography>
                            <Image alt="sample NFT" src='/sample-nft.png' width={250} height={250}/>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <MintNFTCard
                            title={title}
                            mintPrice={mintPrice}
                            imageUrl={imageUrl}
                            description={description}
                            canMint={claimable}
                            numToMint={numToMint}
                            showNumToMint={true}
                            mintStatus={mintStatus}
                            loading={loading}
                            setNumToMint={setNumToMint}
                            action={isPublicMint ? onMintPublic : onMintWhitelist}
                            ownedNFTs={ownedNFTs}
                            maxLimit={maxLimit}
                        />
                        {mintInfo && mintInfo.status && mintStatus && (
                            <Alert variant='outline' severity="success" onClose={resetMintInfo}>
                            {mintInfo.status} <Button href={mintInfo.url} variant="text" sx={{padding: 0, marginLeft: '0px'}} target="_blank">[Link]</Button>
                            </Alert>
                        )}
                        {mintInfo && mintInfo.status && !mintStatus && (
                            <Alert variant='outline' severity="warning" onClose={resetMintInfo}>
                            {mintInfo.status} {mintInfo.link && <Button href={mintInfo.url} variant="text" sx={{padding: 0, marginLeft: '0px'}} target="_blank">[Link]</Button>}
                            </Alert>
                        )}
                    </>
                )}
            </Grid>
            {error && <Alert variant='outline' severity="warning" onClose={() => {setError("")}}>{error}</Alert>}
        </>
    );
}

export default MerkleMintComponent;