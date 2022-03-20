import Head from 'next/head';
import styles from '../styles/Home.module.css';
import MuiNextLink from '@components/core-components/MuiNextLink';
import { Container, Stack, Alert } from '@mui/material';
import GetStarted from '@components/GetStarted';
import MintNFT from '@components/web3/mint-nft';
import { useWeb3React } from '@web3-react/core';

export default function Home() {
  const { activate, deactivate, chainId, active, account, library } = useWeb3React();
  return (
    <Container>
      <Head id="home">
        <title>web3-react with nft merkle tree minting scaffold</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Furry Fox Woodside Club
        </h1>

        <p className={styles.description}>
          <Stack spacing={1}>
            <p>
              Bootstrap an NFT minting site with merkle whitelists.
            </p>
            <p>
            Created by <code className={styles.code}><a href="https://twitter.com/straightupjac" target="_blank" rel="noreferrer">@straightupjac</a></code>, inspired by <MuiNextLink href="https://github.com/scaffold-eth/scaffold-eth/tree/buyer-mints-nft" target="_blank">Scaffold-eth</MuiNextLink>
            </p>
          </Stack>
        </p>
        {/* <div className={styles.hide}>
          <Alert severity="warning" key={"error1"}>Please connect wallet1</Alert>
        </div> */}
        {/* <p>Active: {active}, chain ID: {chainId}</p> */}
        {/* <Alert severity="warning" key="error2">Please connect to {process.env.NEXT_PUBLIC_ACCEPTED_CHAIN_NAME} to mint NFTs</Alert> */}
        {!active && <p></p>}
        {!active && <Alert severity="error">Please connect wallet</Alert>}
        {active && chainId != process.env.NEXT_PUBLIC_ACCEPTED_CHAIN_ID && <Alert severity="error">Please connect to {process.env.NEXT_PUBLIC_ACCEPTED_CHAIN_NAME} to mint NFTs</Alert>}
        {/* <GetStarted /> */}
        {active && chainId==process.env.NEXT_PUBLIC_ACCEPTED_CHAIN_ID && (<MintNFT />)}
      </main>
    </Container>
  )
}