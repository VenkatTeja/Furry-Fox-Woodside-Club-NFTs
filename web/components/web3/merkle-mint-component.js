import { Grid, Stack } from '@mui/material';
import { Button, Card, CardActions, CardContent, Input, Typography } from '@mui/material';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import MintNFTCard from './mint-nft-card';
import { mintWithProof, sampleNFT } from '@pages/utils/_web3';

import { useWeb3React } from '@web3-react/core';
import Web3 from 'web3';

const NOT_CLAIMABLE = 0;
const ALREADY_CLAIMED = 1;
const CLAIMABLE = 2;

const MerkleMintComponent = ({title, description, mintMethod, counterMethod, maxLimitMethod, api}) => {
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
    const [claimable, setClaimable] = useState(NOT_CLAIMABLE);
    const [numToMint, setNumToMint] = useState(1);
    const [mintStatus, setMintStatus] = useState();
    const [mintInfo, setMintInfo] = useState({})

    // team 
    let mintProof = [];
    let isValid = false;
    console.log({account, active})
    const res = useSWR(active && account ? `/api/${api}?address=${account}` : null, {
        fetcher, revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false });
    console.log({res})
    if (!res.error && res.data) {
        const { proof, valid } = res.data;
        mintProof = proof;
        isValid = valid;
    }

    useEffect(async () => {
        setLoading(true);
        console.log(`${title} checking`)
        if (!active || !isValid) {
            console.log(`${title} mint not allowed`, !active, !isValid)
            setClaimable(NOT_CLAIMABLE);
            setLoading(false);
            return;
        } else {
            try {
                console.log({methods: sampleNFT.methods[counterMethod], counterMethod, maxLimitMethod, account})
                let result = await sampleNFT.methods[counterMethod](account).call({ from: account })
                let max = await sampleNFT.methods[maxLimitMethod]().call({from: account})
                console.log({result, max})
                let claimable = parseInt(result) < parseInt(max)
                setClaimable(claimable);
                if(!claimable) {
                    setLoading(false);
                    return;
                }
            } catch(err) {
                console.error(`fetch ${counterMethod} failed`, err)
                setClaimable(false)
                setLoading(false);
                return;
            }
        }
        async function validateClaim() {
            sampleNFT.methods[mintMethod](mintProof, numToMint).call({ from: account }).then(() => {
                setLoading(false);
                setClaimable(CLAIMABLE);
            }).catch((err) => {
                setLoading(false);
                console.warn('validateClaim err', err)
                setClaimable(NOT_CLAIMABLE)
            });
        }
        validateClaim();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mintProof])

    const onMintTeam = async () => {
        setLoading(true)
        setMintInfo({status: null, success: null, url: null})
        const { success, status, url } = await mintWithProof(account, mintProof, mintMethod, numToMint);
        console.log({ success, status, url });
        setMintStatus(success);
        setMintInfo({status, success, url})
        setLoading(false)
    };

    return (
        <>
            <Grid item>
                {(loading && 0) ? (
                    <Card sx={{ maxWidth: 275 }}>
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
                            description={description}
                            canMint={claimable}
                            numToMint={numToMint}
                            showNumToMint={true}
                            mintStatus={mintStatus}
                            loading={loading}
                            setNumToMint={setNumToMint}
                            action={onMintTeam}
                        />
                        {mintInfo && mintInfo.status && (
                            <Card sx={{ maxWidth: 275 }}>
                                <CardContent>
                                    <Typography sx={{ fontSize: 14, wordWrap: 'break-word' }} color="text.secondary" gutterBottom>
                                        {mintInfo.status} [<Button href={mintInfo.url} variant="text">Link</Button>]
                                    </Typography>
                                </CardContent>
                            </Card>
                            )}
                    </>
                )}
            </Grid>
        </>
    );
}

export default MerkleMintComponent;