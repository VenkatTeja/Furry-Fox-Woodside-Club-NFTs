## `FFWClubNFT`





### `validateEthPayment(uint256 count)`

Modifier to validate Eth payments on payable functions


compares the product of the state variable `_mintPrice` and supplied `count` to msg.value



### `constructor(address _proxyRegistryAddress, uint64 maxSupply)` (public)





### `setPhaseAndMintPrice(enum FFWClubNFT.SalePhase _phase, uint256 _mintPrice)` (public)

Update phase and mint price together. The phase can only advance.




### `_setPhase(enum FFWClubNFT.SalePhase _phase)` (internal)





### `_setMintPrice(uint256 _mintPrice)` (internal)

Update mint price




### `setBaseURI(string __baseURI)` (public)

Update base NFT URI




### `setPaused(bool isPaused)` (public)

Pause/unpause minting
@custom:only-owner
@custom:only-owner



### `freezeMetadata()` (external)

Freezes the metadata
permamently freezes the metadata so that no more changes are possible
@custom:only-owner

sets the state of `metadataIsFrozen` to true


### `freezeSettings()` (external)

Freezes the settings
permamently freezes the limtis so that no more changes are possible
@custom:only-owner

sets the state of `settingsIsFrozen` to true


### `_baseURI() → string` (internal)

get base URI



### `reduceSupply(uint64 newMaxSupply)` (public)

Supply can be reduced but cannot be increased. 
Once reduced, cannot be increased again.
constraints: supply can only reduce up what has been minted already
@custom:only-owner



### `setMerkleMintVerification(bool isEnabled)` (public)

Switches on/off if merkle proof verification has to be done
if disabled, merkle tree verification will no longer happen 
and anyone will be able to mint
@custom:only-owner



### `setLimits(uint16 airdropLimit, uint16 earlyAccessLimit, uint16 vipAccessLimit, uint16 preSaleLimit, uint16 publicSaleLimit, uint64 totalTeamReserve, uint64 totalAirdropReserve, uint64 earlyAccessReserve, uint64 vipAccessReserve, uint64 totalPresaleReserve)` (public)

update per wallet limits and reserve limits across various phases


cannot be updated once settings are frozen
@custom:only-owner

### `setMerkleRoots(bytes32 _airdropRoot, bytes32 _earlyAccessRoot, bytes32 _vipAccessRoot, bytes32 _whitelistRoot)` (public)

@custom:only-owner



### `setAirdropMerkleRoot(bytes32 _root)` (public)

set merkle tree root for airdrop
@custom:only-owner



### `setEarlyAccessMerkleRoot(bytes32 _root)` (public)

set merkle tree root for early access
@custom:only-owner



### `setVIPAccessMerkleRoot(bytes32 _root)` (public)

set merkle tree root for vip access
@custom:only-owner



### `setWhitelistMerkleRoot(bytes32 _root)` (public)

set merkle tree root for presale
@custom:only-owner



### `_verifyMerkleLeaf(bytes32 _merkleRoot, bytes32[] _merkleProof) → bool` (internal)

for a given merkleRoot and merkle, 
verifies if the sender has access to mint



### `mintToTeam(uint64[] counts, address[] toAddresses)` (public)

Mint reserved tokens for the team. Only Owner
pass array of toAddresses and array of quantity for each address
constraints: 1. length of array of to address should be equal to length of counts array
2. Cannot mint beyond team reserve
@custom:only-owner



### `mintAirdrop(bytes32[] _merkleProof, uint64 count)` (public)

The minter can pass their proof and quantity (count)
and get their mints.
mint open during any phase and no mint price
constraints: 1. Max mints/wallet limit
2. Total reserve limit



### `mintEarlyAccessSale(bytes32[] _merkleProof, uint64 count)` (public)

Mint during Early access phase
only wallets eligible in this phase can mint if merkle mint is enabled
Accepts ETH. Verifies if ETH sent >= current mint price * count



### `mintVIPAccessSale(bytes32[] _merkleProof, uint64 count)` (public)

Mint during VIP access phase
only wallets eligible in this phase can mint if merkle mint is enabled
Accepts ETH. Verifies if ETH sent >= current mint price * count



### `mintPresale(bytes32[] _merkleProof, uint64 count)` (public)

Mint during PreSale phase
only wallets eligible in this phase can mint if merkle mint is enabled
Accepts ETH. Verifies if ETH sent >= current mint price * count



### `_merkleMintWrapper(mapping(address => uint64) counter, uint16 maxPerWallet, uint64 totalReserve, uint64 totalReserveLimit, uint64 count, enum FFWClubNFT.SalePhase acceptedPhase, bytes32[] _merkleProof, bytes32 merkleRoot)` (internal)

Internal method for common whitelist mint logic based on phase
Method used for Early, VIP and Pre-sale mints
Checks for the following before mint:
1. per wallet limits
2. Total reserve under the phase
3. Phase is eligible
Then, Calls internal method `_mintWhitelist`
if merkleMint is disabled, anyone can mint using these methods



### `_mintWhitelist(bytes32 root, bytes32[] proof, uint64 count, bool checkProof)` (internal)

Verifies proof and mints NFT
if checkProof is enabled, verifies the proof
Then calls internal method `_mint`



### `_mint(address _to, uint64 quantity)` (internal)

Verifies supply and mints
Does the following checks:
1. mint is within the max supply
2. if minting is not paused



### `mintTo(address _to, uint64 count)` (public)

Public Mint accessible to anyone once public sale phase is enabled
Accepts ETH. Verifies if ETH sent >= current mint price * count



### `disbursePayments(address[] payees_, uint256[] amounts_)` (external)

Send ETH held by contract. Only Owner.
@custom:only-owner



### `burn(uint256 tokenId)` (public)

an NFT owner can burn their NFTs






### `SalePhase`

















