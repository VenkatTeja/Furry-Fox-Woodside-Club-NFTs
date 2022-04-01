import { Button, Card, CardActions, CardContent, Container, Item, Grid, Paper, Input, Typography } from '@mui/material';
import Image from 'next/image';

const MintNFTCard = ({title, description, action, canMint, showNumToMint, 
  numToMint, setNumToMint, mintStatus, loading, mintPrice, imageUrl}) => {
  const handleChange = (event) => {
    const numToMint = parseInt(event.target.value);
    setNumToMint(numToMint);
  };

  return (
    <Paper
      sx={{
        p: 2,
        margin: 'auto',
        width: 1000,
        flexGrow: 1,
        backgroundColor:'#171717'
      }}>
      <Grid container spacing={2}>
        <Grid item xs={3}>
            <Image alt="sample NFT" src={imageUrl} layout="responsive" width={'100vw'} height={'100%'}/>
        </Grid>
        
        <Grid item xs={12} sm container>
          <Grid item xs container direction="column" spacing={2}>
            <Grid item xs>
              <Typography variant="h5" sx={{ fontSize: 14, color: "text.primary", marginBottom: '10px' }}>
                {title}
              </Typography>
              
              <Typography variant="body1" color="text.secondary">
                {mintStatus ? "Success! Check your wallet in a few minutes."
                  : description}
              </Typography>
            </Grid>
            <Grid item>
              {loading ? (
                <CardActions>Loading....</CardActions>) : (
                <CardActions>
                  {showNumToMint &&
                    <Input onChange={handleChange} defaultValue={numToMint} type="number" label="Quantity to mint"
                      sx={{mx: 3, marginLeft: 0}}
                    />}
                  <Button disabled={canMint} onClick={action} variant="contained">Mint</Button>
                </CardActions>
              )}
            </Grid>
          </Grid>
          <Grid item>
            <Typography variant="h6" component="div">
              {mintPrice} ETH
            </Typography>
          </Grid>
        </Grid>
            
            
      </Grid>
    </Paper>
  );
}

export default MintNFTCard;