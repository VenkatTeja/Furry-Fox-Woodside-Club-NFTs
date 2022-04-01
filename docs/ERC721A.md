## `ERC721A`



Implementation of https://eips.ethereum.org/EIPS/eip-721[ERC721] Non-Fungible Token Standard, including
the Metadata extension. Built to optimize for lower gas during batch mints.

Assumes serials are sequentially minted starting at _startTokenId() (defaults to 0, e.g. 0, 1, 2, 3..).

Assumes that an owner cannot have more than 2**64 - 1 (max value of uint64) of supply.

Assumes that the maximum token id cannot exceed 2**256 - 1 (max value of uint256).


### `constructor(string name_, string symbol_)` (public)





### `_startTokenId() → uint256` (internal)

To change the starting tokenId, please override this function.



### `totalSupply() → uint256` (public)



Burned tokens are calculated here, use _totalMinted() if you want to count just minted tokens.

### `_totalMinted() → uint256` (internal)

Returns the total amount of tokens minted in the contract.



### `supportsInterface(bytes4 interfaceId) → bool` (public)



See {IERC165-supportsInterface}.

### `balanceOf(address owner) → uint256` (public)



See {IERC721-balanceOf}.

### `_numberMinted(address owner) → uint256` (internal)

Returns the number of tokens minted by `owner`.



### `_numberBurned(address owner) → uint256` (internal)

Returns the number of tokens burned by or on behalf of `owner`.



### `_getAux(address owner) → uint64` (internal)

Returns the auxillary data for `owner`. (e.g. number of whitelist mint slots used).



### `_setAux(address owner, uint64 aux)` (internal)

Sets the auxillary data for `owner`. (e.g. number of whitelist mint slots used).
If there are multiple variables, please pack them into a uint64.



### `_ownershipOf(uint256 tokenId) → struct ERC721A.TokenOwnership` (internal)

Gas spent here starts off proportional to the maximum mint batch size.
It gradually moves to O(1) as tokens get transferred around in the collection over time.



### `ownerOf(uint256 tokenId) → address` (public)



See {IERC721-ownerOf}.

### `name() → string` (public)



See {IERC721Metadata-name}.

### `symbol() → string` (public)



See {IERC721Metadata-symbol}.

### `tokenURI(uint256 tokenId) → string` (public)



See {IERC721Metadata-tokenURI}.

### `_baseURI() → string` (internal)



Base URI for computing {tokenURI}. If set, the resulting URI for each
token will be the concatenation of the `baseURI` and the `tokenId`. Empty
by default, can be overriden in child contracts.

### `approve(address to, uint256 tokenId)` (public)



See {IERC721-approve}.

### `getApproved(uint256 tokenId) → address` (public)



See {IERC721-getApproved}.

### `setApprovalForAll(address operator, bool approved)` (public)



See {IERC721-setApprovalForAll}.

### `isApprovedForAll(address owner, address operator) → bool` (public)



See {IERC721-isApprovedForAll}.

### `transferFrom(address from, address to, uint256 tokenId)` (public)



See {IERC721-transferFrom}.

### `safeTransferFrom(address from, address to, uint256 tokenId)` (public)



See {IERC721-safeTransferFrom}.

### `safeTransferFrom(address from, address to, uint256 tokenId, bytes _data)` (public)



See {IERC721-safeTransferFrom}.

### `_exists(uint256 tokenId) → bool` (internal)



Returns whether `tokenId` exists.

Tokens can be managed by their owner or approved accounts via {approve} or {setApprovalForAll}.

Tokens start existing when they are minted (`_mint`),

### `_safeMint(address to, uint256 quantity)` (internal)





### `_safeMint(address to, uint256 quantity, bytes _data)` (internal)



Safely mints `quantity` tokens and transfers them to `to`.

Requirements:

- If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called for each safe transfer.
- `quantity` must be greater than 0.

Emits a {Transfer} event.

### `_mint(address to, uint256 quantity, bytes _data, bool safe)` (internal)



Mints `quantity` tokens and transfers them to `to`.

Requirements:

- `to` cannot be the zero address.
- `quantity` must be greater than 0.

Emits a {Transfer} event.

### `_burn(uint256 tokenId)` (internal)



This is equivalent to _burn(tokenId, false)

### `_burn(uint256 tokenId, bool approvalCheck)` (internal)



Destroys `tokenId`.
The approval is cleared when the token is burned.

Requirements:

- `tokenId` must exist.

Emits a {Transfer} event.

### `_beforeTokenTransfers(address from, address to, uint256 startTokenId, uint256 quantity)` (internal)



Hook that is called before a set of serially-ordered token ids are about to be transferred. This includes minting.
And also called before burning one token.

startTokenId - the first token id to be transferred
quantity - the amount to be transferred

Calling conditions:

- When `from` and `to` are both non-zero, `from`'s `tokenId` will be
transferred to `to`.
- When `from` is zero, `tokenId` will be minted for `to`.
- When `to` is zero, `tokenId` will be burned by `from`.
- `from` and `to` are never both zero.

### `_afterTokenTransfers(address from, address to, uint256 startTokenId, uint256 quantity)` (internal)



Hook that is called after a set of serially-ordered token ids have been transferred. This includes
minting.
And also called after one token has been burned.

startTokenId - the first token id to be transferred
quantity - the amount to be transferred

Calling conditions:

- When `from` and `to` are both non-zero, `from`'s `tokenId` has been
transferred to `to`.
- When `from` is zero, `tokenId` has been minted for `to`.
- When `to` is zero, `tokenId` has been burned by `from`.
- `from` and `to` are never both zero.



### `TokenOwnership`


address addr


uint64 startTimestamp


bool burned


### `AddressData`


uint64 balance


uint64 numberMinted


uint64 numberBurned


uint64 aux



