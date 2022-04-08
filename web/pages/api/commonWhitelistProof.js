import cors from 'cors';
import cache from 'express-redis-cache';

const c = cache();

const run = (req, res) => (fn) => new Promise((resolve, reject) => {
  fn(req, res, (result) =>
      result instanceof Error ? reject(result) : resolve(result)
  )
})

const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
let earlylist = require('../../data/earlylist.json');
let viplist = require('../../data/viplist.json');
let whitelist = require('../../data/whitelist.json');

let map = {
  earlyAccess: {
    addresses: earlylist,
    merkleTree: new MerkleTree(earlylist.map(addr => keccak256(addr)), keccak256, { sortPairs: true })
  },
  VIPAccess: {
    addresses: viplist,
    merkleTree: new MerkleTree(viplist.map(addr => keccak256(addr)), keccak256, { sortPairs: true })
  },
  whitelistAccess: {
    addresses: whitelist,
    merkleTree: new MerkleTree(whitelist.map(addr => keccak256(addr)), keccak256, { sortPairs: true })
  },
}

const handler = async (req, res) => {
  const middleware = run(req, res);
  await middleware(cors());
  await middleware(c.route());

  /** validate req type **/
  if (req.method !== 'GET') {
    res.status(400).json({});
    return;
  }
  console.log('api', req.query)
  if(req.query.whitelistName == 'publicAccess') {
    console.log('public access mint')
    res.status(200).json({
      proof: [],
      valid: true,
    });
    return;
  }
  
  const address = req.query.address;
  if (!address) {
    
    res.status(400).json({ msg: "address is required"});
    return;
  }
  const whitelistName = req.query.whitelistName;
  if(!map[whitelistName]) {
    res.status(400).json({ msg: "whitelistName is required"});
    return;
  }
  let {addresses, merkleTree} = map[whitelistName]
  if(!addresses.includes(address)) {
    res.status(400).json({ msg: "address not in whitelist"});
    return;
  }
  
  const hashedAddress = keccak256(address);
  const proof = merkleTree.getHexProof(hashedAddress);
  const root = merkleTree.getHexRoot();

  // just for front-end display convenience
  // proof will be validated in smart contract as well
  const valid = merkleTree.verify(proof, hashedAddress, root);
  console.log('proof ready', proof, valid)
  res.status(200).json({
    proof,
    valid,
  });
}

export default handler
