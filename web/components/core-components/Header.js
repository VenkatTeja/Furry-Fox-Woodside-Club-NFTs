import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import { styled } from "@mui/system";
import IconButton from "@mui/material/IconButton"
import BubbleChartTwoToneIcon from '@mui/icons-material/BubbleChartTwoTone';
import MuiNextLink from "@components/core-components/MuiNextLink";
import Navbar from '@components/core-components/Navbar'
import SideDrawer from "@components/core-components/SideDrawer";
import HideOnScroll from "@components/core-components/HideOnScroll";
import Fab from "@mui/material/Fab";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import BackToTop from "@components/core-components/BackToTop";
import Connect from "@components/web3/connect";
import { Stack } from "@mui/material";
import { useWeb3React } from '@web3-react/core';
import { useEffect, useState, useReducer } from "react";


const Offset = styled("div")(({ theme }) => theme.mixins.toolbar);

export let navLinks = [
  { title: 'About', path: 'https://furryfoxwoodside.club/', target: '_blank' },
  { title: 'How to Mint?', path: 'https://bit.ly/3xgbZAH', target: '_blank' },
  { title: 'Contact us', path: 'https://discord.com/invite/CnrPy9VKZz', target: '_blank' }
];



const Header = () => {
  const { active, account, chainId } = useWeb3React();

  const [isReady, setReady] = useState(true)
  let openseaLink = 'opensea.io'
  if(process.env.NEXT_PUBLIC_ENVIRONMENT == 'development')
    openseaLink = 'testnets.opensea.io'
  
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(()=>{
    setReady(false)
      if(account) {
        let containsYourNFTsLink = false;
        navLinks.forEach(item => {
          if(item.title == 'Your NFTs')
            containsYourNFTsLink = true
        })
        if(!containsYourNFTsLink) {
          let chain = process.env.NEXT_PUBLIC_ENVIRONMENT == 'development' ? 'MUMBAI' : 'MATIC'
          navLinks.splice(2, 0,
            { title: 'Your NFTs', path: `https://${openseaLink}/${account}?search[chains][0]=${chain}`,
            target: '_blank'},
          )
        }
        forceUpdate()
      }
      setReady(true)
    }, [account])

  return (
    <>
    {/* <HideOnScroll> */}
        <AppBar position="fixed" sx={{ backgroundColor: '#0E0E0E' }} elevation={0}>
          <Toolbar>
            <Container
              maxWidth="lg"
              sx={{ display: `flex`, justifyContent: `space-between`, alignItems: 'center' }}
            >
              <IconButton edge="start" aria-label="home">
                <MuiNextLink activeClassName="active" href='/'>
                  {/* <BubbleChartTwoToneIcon
                    sx={{
                      color: (theme) => theme.palette.primary,
                    }}
                    fontSize="large"
                  /> */}
                </MuiNextLink>
              </IconButton>
              <Stack direction="row" alignItems='center'>
                {isReady && 
                  <>
                    <Navbar navLinks={navLinks} />
                    <SideDrawer navLinks={navLinks} />
                  </>}
                <Connect />
              </Stack>
            </Container>
          </Toolbar>
        </AppBar>
      {/* </HideOnScroll> */}
      <Offset id="back-to-top-anchor" />
      <BackToTop>
        <Fab color="primary" size="large" aria-label="back to top">
          <KeyboardArrowUp />
        </Fab>
      </BackToTop>
    </>
  );
};

export default Header;
