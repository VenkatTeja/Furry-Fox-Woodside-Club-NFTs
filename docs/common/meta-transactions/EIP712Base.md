## `EIP712Base`






### `_initializeEIP712(string name)` (internal)





### `_setDomainSeperator(string name)` (internal)





### `getDomainSeperator() → bytes32` (public)





### `getChainId() → uint256` (public)





### `toTypedMessageHash(bytes32 messageHash) → bytes32` (internal)

Accept message hash and returns hash message in EIP712 compatible form
So that it can be used to recover signer from signature signed using EIP712 formatted data
https://eips.ethereum.org/EIPS/eip-712
"\\x19" makes the encoding deterministic
"\\x01" is the version byte to make it compatible to EIP-191





### `EIP712Domain`


string name


string version


address verifyingContract


bytes32 salt



