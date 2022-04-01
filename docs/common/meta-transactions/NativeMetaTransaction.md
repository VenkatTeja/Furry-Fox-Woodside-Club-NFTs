## `NativeMetaTransaction`






### `executeMetaTransaction(address userAddress, bytes functionSignature, bytes32 sigR, bytes32 sigS, uint8 sigV) → bytes` (public)





### `hashMetaTransaction(struct NativeMetaTransaction.MetaTransaction metaTx) → bytes32` (internal)





### `getNonce(address user) → uint256 nonce` (public)





### `verify(address signer, struct NativeMetaTransaction.MetaTransaction metaTx, bytes32 sigR, bytes32 sigS, uint8 sigV) → bool` (internal)






### `MetaTransactionExecuted(address userAddress, address payable relayerAddress, bytes functionSignature)`






### `MetaTransaction`


uint256 nonce


address from


bytes functionSignature



