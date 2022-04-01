## `FactoryERC721`






### `name() → string` (external)

Returns the name of this factory.



### `symbol() → string` (external)

Returns the symbol for this factory.



### `numOptions() → uint256` (external)

Number of options the factory supports.



### `canMint(uint256 _optionId) → bool` (external)



Returns whether the option ID can be minted. Can return false if the developer wishes to
restrict a total supply per option ID (or overall).

### `tokenURI(uint256 _optionId) → string` (external)



Returns a URL specifying some metadata about the option. This metadata can be of the
same structure as the ERC721 metadata.

### `supportsFactoryInterface() → bool` (external)

Indicates that this is a factory contract. Ideally would use EIP 165 supportsInterface()



### `mint(uint256 _optionId, address _toAddress)` (external)



Mints asset(s) in accordance to a specific address with a particular "option". This should be
callable only by the contract owner or the owner's Wyvern Proxy (later universal login will solve this).
Options should also be delineated 0 - (numOptions() - 1) for convenient indexing.





