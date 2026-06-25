[**@atlas-chain/sdk v0.6.11**](../index.md)

***

[@atlas-chain/sdk](../index.md) / main

# main

## Enumerations

- [AttributeValueType](enumerations/AttributeValueType.md)
- [EntityOperationType](enumerations/EntityOperationType.md)

## Classes

- [EntityMutationError](classes/EntityMutationError.md)
- [NoCursorOrLimitError](classes/NoCursorOrLimitError.md)
- [NoEntityFoundError](classes/NoEntityFoundError.md)
- [NoMoreResultsError](classes/NoMoreResultsError.md)
- [PayloadProviderClient](classes/PayloadProviderClient.md)

## Interfaces

- [Entity](interfaces/Entity.md)

## Type Aliases

- [ArkivClient](type-aliases/ArkivClient.md)
- [ArkivRpcSchema](type-aliases/ArkivRpcSchema.md)
- [Attribute](type-aliases/Attribute.md)
- [ChangeOwnershipParameters](type-aliases/ChangeOwnershipParameters.md)
- [ChangeOwnershipReturnType](type-aliases/ChangeOwnershipReturnType.md)
- [CreateEntityParameters](type-aliases/CreateEntityParameters.md)
- [CreateEntityReturnType](type-aliases/CreateEntityReturnType.md)
- [DeleteEntityParameters](type-aliases/DeleteEntityParameters.md)
- [DeleteEntityReturnType](type-aliases/DeleteEntityReturnType.md)
- [ExtendEntityParameters](type-aliases/ExtendEntityParameters.md)
- [ExtendEntityReturnType](type-aliases/ExtendEntityReturnType.md)
- [GetBlockTimingReturnType](type-aliases/GetBlockTimingReturnType.md)
- [HydratePayloadOptions](type-aliases/HydratePayloadOptions.md)
- [MimeType](type-aliases/MimeType.md)
- [MutateEntitiesParameters](type-aliases/MutateEntitiesParameters.md)
- [MutateEntitiesReturnType](type-aliases/MutateEntitiesReturnType.md)
- [NormalizedPayloadProviderConfig](type-aliases/NormalizedPayloadProviderConfig.md)
- [OnEntityCreatedEvent](type-aliases/OnEntityCreatedEvent.md)
- [OnEntityDeletedEvent](type-aliases/OnEntityDeletedEvent.md)
- [OnEntityExpiredEvent](type-aliases/OnEntityExpiredEvent.md)
- [OnEntityExpiresInExtendedEvent](type-aliases/OnEntityExpiresInExtendedEvent.md)
- [OnEntityOwnerChangedEvent](type-aliases/OnEntityOwnerChangedEvent.md)
- [OnEntityUpdatedEvent](type-aliases/OnEntityUpdatedEvent.md)
- [PayloadProviderArkivContext](type-aliases/PayloadProviderArkivContext.md)
- [PayloadProviderConfig](type-aliases/PayloadProviderConfig.md)
- [PayloadProviderMetadata](type-aliases/PayloadProviderMetadata.md)
- [PayloadProviderOperation](type-aliases/PayloadProviderOperation.md)
- [PayloadProviderReceipt](type-aliases/PayloadProviderReceipt.md)
- [PayloadProviderSignature](type-aliases/PayloadProviderSignature.md)
- [PayloadProviderSubmission](type-aliases/PayloadProviderSubmission.md)
- [PayloadProviderVerificationContext](type-aliases/PayloadProviderVerificationContext.md)
- [PayloadProviderVerificationResult](type-aliases/PayloadProviderVerificationResult.md)
- [PayloadReference](type-aliases/PayloadReference.md)
- [PayloadReferenceSummary](type-aliases/PayloadReferenceSummary.md)
- [PublicArkivActions](type-aliases/PublicArkivActions.md)
- [PublicArkivClient](type-aliases/PublicArkivClient.md)
- [PublicArkivClientConfig](type-aliases/PublicArkivClientConfig.md)
- [QueryOptions](type-aliases/QueryOptions.md)
- [QueryOptionsIncludeData](type-aliases/QueryOptionsIncludeData.md)
- [QueryOptionsOrderBy](type-aliases/QueryOptionsOrderBy.md)
- [QueryReturnType](type-aliases/QueryReturnType.md)
- [RpcEntity](type-aliases/RpcEntity.md)
- [RpcIncludeData](type-aliases/RpcIncludeData.md)
- [RpcOrderByAttribute](type-aliases/RpcOrderByAttribute.md)
- [RpcPayloadReference](type-aliases/RpcPayloadReference.md)
- [RpcQueryOptions](type-aliases/RpcQueryOptions.md)
- [SubmitArkivPayloadInput](type-aliases/SubmitArkivPayloadInput.md)
- [SubmitArkivPayloadResponse](type-aliases/SubmitArkivPayloadResponse.md)
- [TxParams](type-aliases/TxParams.md)
- [UpdateEntityParameters](type-aliases/UpdateEntityParameters.md)
- [UpdateEntityReturnType](type-aliases/UpdateEntityReturnType.md)
- [WalletArkivActions](type-aliases/WalletArkivActions.md)
- [WalletArkivClient](type-aliases/WalletArkivClient.md)
- [WalletArkivClientConfig](type-aliases/WalletArkivClientConfig.md)

## Variables

- [DEFAULT\_PAYLOAD\_PROVIDER\_NAMESPACE](variables/DEFAULT_PAYLOAD_PROVIDER_NAMESPACE.md)

## Functions

- [bytesToBase64](functions/bytesToBase64.md)
- [canonicalizePayloadReceipt](functions/canonicalizePayloadReceipt.md)
- [chainFromName](functions/chainFromName.md)
- [createPublicClient](functions/createPublicClient.md)
- [createWalletClient](functions/createWalletClient.md)
- [getPayloadProviderConfig](functions/getPayloadProviderConfig.md)
- [payloadProviderChecksum](functions/payloadProviderChecksum.md)
- [payloadProviderPayloadId](functions/payloadProviderPayloadId.md)
- [receiptForPayloadMetadata](functions/receiptForPayloadMetadata.md)
- [setPayloadProviderConfig](functions/setPayloadProviderConfig.md)
- [verifyPayloadMetadata](functions/verifyPayloadMetadata.md)
- [verifyPayloadProviderSignature](functions/verifyPayloadProviderSignature.md)

## References

### jsonToPayload

Re-exports [jsonToPayload](../utils/functions/jsonToPayload.md)

***

### stringToPayload

Re-exports [stringToPayload](../utils/functions/stringToPayload.md)
