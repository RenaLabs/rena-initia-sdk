# Rena Initia SDK

A TypeScript SDK for interacting with the Initia blockchain. This SDK provides a simple interface for common blockchain operations such as getting account information, sending tokens, and uploading signatures.

## Installation

```bash
npm install rena-initia-sdk
```

## Quick Start

```typescript
import { InitiaSDK } from 'rena-initia-sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize SDK with mnemonic and RPC URL
const sdk = new InitiaSDK(
  process.env.MNEMONIC ?? '',
  process.env.RPC_URL ?? 'https://rest.testnet.initia.xyz'
);

// Get account information
async function getAccountInfo() {
  const address = await sdk.getAccountAddress();
  console.log('Account Address:', address);

  const balance = await sdk.getAccountBalance(address);
  console.log('Account Balance:', balance);

  return { address, balance };
}

// Send tokens to another address
async function sendTokens() {
  const senderAddress = await sdk.getAccountAddress();
  const recipientAddress = 'init1dflp5l3p5y6zhh7tnus60j2w88mqhp6p2tpncs';
  const amount = '1000uinit';

  // Create send token message
  const sendMsg = sendToken(
    senderAddress,
    recipientAddress,
    amount
  );

  // Create and sign transaction
  const signedTx = await sdk.wallet.createAndSignTx({
    msgs: [sendMsg],
    memo: 'Token transfer',
  });

  // Broadcast transaction
  const result = await sdk.rest.tx.broadcast(signedTx);
  console.log('Transaction result:', result);

  return result;
}
```

## Environment Variables

Create a `.env` file in your project root with the following variables:

```
MNEMONIC='your mnemonic phrase here'
RPC_URL='https://rest.testnet.initia.xyz'
```

## API Reference

### InitiaSDK

The main class for interacting with the Initia blockchain.

#### Constructor

```typescript
constructor(mnemonic: string, rpcUrl: string)
```

- `mnemonic`: The mnemonic phrase for the wallet
- `rpcUrl`: The RPC URL for the Initia blockchain (defaults to testnet)

#### Methods

- `getAccountAddress()`: Gets the account address associated with the wallet
- `getAccountBalance(address?)`: Gets the account balance for a given address (defaults to the wallet's address)

### Utility Functions

#### sendToken

```typescript
function sendToken(sender: string, contractAddress: string, amount: string): MsgSend
```

Creates a message to send tokens to another address.

#### uploadSignature

```typescript
function uploadSignature(
  sender: string,
  contractAddress: string,
  module: string,
  functionName: string,
  typeArgs: any[],
  args: any[]
): MsgExecute
```

Creates a message to upload a signature to a smart contract.

#### uuidToU256

```typescript
function uuidToU256(uuid: string): bigint
```

Converts a UUID string to a U256 (bigint) representation.

#### u256ToUuid

```typescript
function u256ToUuid(u256: bigint): string
```

Converts a U256 (bigint) representation back to a UUID string.

## License

MIT 