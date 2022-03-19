import { Button, Card, CardActions, CardContent, Input, Typography } from '@mui/material';
import Image from 'next/image';

const MintNFTCard = ({title, description, action, canMint, showNumToMint, numToMint, setNumToMint, mintStatus, loading}) => {
  const handleChange = (event) => {
    const numToMint = parseInt(event.target.value);
    setNumToMint(numToMint);
  };

  return (
    <Card sx={{ maxWidth: 275 }}>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Image alt="sample NFT" src='/sample-nft.png' width={250} height={250}/>
        {mintStatus ? <p>Success! Check your wallet in a few minutes.</p> : <p>{description}</p>}
      </CardContent>
      {loading ? (
        <CardActions>Loading....</CardActions>) : (
        <CardActions>
          {showNumToMint &&
            <Input onChange={handleChange} defaultValue={numToMint} type="number" label="number to mint"
              sx={{mx: 3}}
            />}
          <Button disabled={!canMint} onClick={action} variant="contained">Mint</Button>
        </CardActions>
      )}
    </Card>
  );
}

export default MintNFTCard;