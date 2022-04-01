## `ERC721Tradable`






### `constructor(string _name, string _symbol, address _proxyRegistryAddress)` (internal)





### `isApprovedForAll(address owner, address operator) → bool` (public)

Override isApprovedForAll to whitelist user's OpenSea proxy accounts to enable gas-less listings.



### `_msgSender() → address sender` (internal)

This is used instead of msg.sender as transactions won't be sent by the original token owner, but by OpenSea.






