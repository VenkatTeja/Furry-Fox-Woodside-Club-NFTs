## `FFWClubFactory`






### `constructor(address _proxyRegistryAddress, address _nftAddress)` (public)





### `name() → string` (external)





### `symbol() → string` (external)





### `supportsFactoryInterface() → bool` (public)





### `setBaseURI(string _baseURI)` (public)





### `numOptions() → uint256` (public)





### `transferOwnership(address newOwner)` (public)





### `mint(uint256 _optionId, address _toAddress)` (public)





### `canMint(uint256 _optionId) → bool` (public)





### `tokenURI(uint256 _optionId) → string` (external)





### `transferFrom(address, address _to, uint256 _tokenId)` (public)

Hack to get things to work automatically on OpenSea.
Use transferFrom so the frontend doesn't have to worry about different method names.



### `isApprovedForAll(address _owner, address _operator) → bool` (public)

Hack to get things to work automatically on OpenSea.
Use isApprovedForAll so the frontend doesn't have to worry about different method names.



### `ownerOf(uint256) → address _owner` (public)

Hack to get things to work automatically on OpenSea.
Use isApprovedForAll so the frontend doesn't have to worry about different method names.




### `Transfer(address from, address to, uint256 tokenId)`







