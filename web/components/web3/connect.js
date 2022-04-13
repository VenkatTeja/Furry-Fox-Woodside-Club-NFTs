import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import Button from '@mui/material/Button';
import { styled as muiStyled, alpha } from '@mui/material/styles';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useWeb3React } from '@web3-react/core';
import { abridgeAddress, injected, useENSName, walletConnect, activateInjectedProvider } from '@pages/utils/_web3';
import ConnectModal from "@components/web3/connectModal";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Box, Chip } from "@mui/material";
import { sampleNFT, refreshMetamaskProvider, refreshWalletConnectProvider, web3 } from '@pages/utils/_web3';
import Web3 from 'web3';
import { InjectedConnector } from "@web3-react/injected-connector";

export default function Connect() {
  const { activate, deactivate, chainId, active, account, library } = useWeb3React();
  const router = useRouter();
  console.log({chainId,active, activate})
  // for the modal
  const [balance, setBalance] = useState('0 wETH')
  const [isWalletConnectReady, setWalletConnectReady] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const walletConnectConnector = walletConnect;
  const handleClose = () => setIsModalVisible(false);
  const handleConnect = () => {
    setIsModalVisible(true);
    handleMenuClose();
  };

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

  const fetchBalance = async () => {
    if(account && chainId==process.env.NEXT_PUBLIC_ACCEPTED_CHAIN_ID) {
      await WETHContract()
      let balance = await WETH.methods.balanceOf(account).call()
      let balEther = web3.utils.fromWei(balance)
      setBalance(`${parseFloat(balEther).toFixed(4)} wETH`)
    }
  }

  useEffect(()=>{
    if(isWalletConnectReady && active) {
      console.log('isActive111')
      fetchBalance()
    }
  }, [active, isWalletConnectReady])
  // for the dropdown menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleBodyScroll = () => {
    document.body.style.overflow = 'visible';
  }

  const handleLoginClick = async (type) => {
    if (type === 'metamask') {
      activateInjectedProvider('MetaMask')
      await activate(injected);
      await refreshMetamaskProvider()
    } else {
      await activate(walletConnectConnector);
      await refreshWalletConnectProvider()
      console.log('isActive222')
      setWalletConnectReady(true)
    }
    handleBodyScroll();
    handleClose();
  }

  const goToWallet = async () => {
    router.push('/wallet');
  }

  const handleDisconnect = async () => {
    await deactivate();
  }

  const ENSName = useENSName(library, account);

  return (
    <>
    {active && <Chip label={balance} variant="outline"
                  sx={{background: 'rgb(255 214 68 / 50%)', marginRight: '25px', color: 'black'}} />}
    <Box sx={{textAlign: 'center'}}>
    
    
    {!active ? (
      <CustomButton variant="contained"
        disableElevation
        onClick={handleConnect}
        >
          Connect Wallet
        </CustomButton>
        ) :
    <div>
      <Connected
        variant="contained"
        onClick={handleMenuClick}
        disableElevation
        endIcon={<KeyboardArrowDownIcon />}
      >
        {account && (ENSName || abridgeAddress(account))}
      </Connected>
      <CustomMenu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {/* <MenuItem
          variant="contained"
          onClick={goToWallet}
          divider
        >
          Your wallet
        </MenuItem> */}
        <MenuItem
          variant="contained"
          onClick={handleDisconnect}
        >
          Disconnect
        </MenuItem>
      </CustomMenu>
    </div>
    }
    <ConnectModal
      isModalVisible={isModalVisible}
      handleLoginClick={handleLoginClick}
      handleClose={handleClose}
    />
    </ Box>
    </>
  )
}

const CustomButton = muiStyled(Button)(({ theme }) => ({
  borderRadius: '20px',
  height: '45px',
  fontSize: '1.2rem',
  fontFamily: [
    'Space Mono,monospace',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
}));

const Connected = muiStyled(Button)(({ theme }) => ({
  borderRadius: '20px',
  height: '45px',
  fontSize: '1.1rem',
  padding: '1rem',
  textTransform: 'none',
  fontFamily: [
    'Space Mono,monospace',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
}));

const CustomMenu = muiStyled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(0.5),
    minWidth: 180,
    color: theme.palette.primary,
    background: theme.palette.primary.light,
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      color: 'white',
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.primary.light,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.light,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
  },
}));
