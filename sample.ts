import { InitiaSDK } from './src/InitiaSDK';
import dotenv from 'dotenv';
import { sendToken, uploadSignature, uuidToU256, u256ToUuid, bridgeToken, bridgeOutToken } from './src/tee';
import { bcs, Coin } from '@initia/initia.js';
import { getChainConfig } from './src/config';

// Load environment variables from .env file
dotenv.config();

// Default chain ID
const mainChainId = 'initiation-2';

// Initialize SDK with mnemonic and RPC URL
const sdk = new InitiaSDK(
    process.env.MNEMONIC ?? '',
    mainChainId,
    getChainConfig(mainChainId).rpcUrl
);

/**
 * Example 1: Get account information
 */
async function getAccountInfo() {
    try {
        // Get account address
        const address = await sdk.getAccountAddress();
        console.log('Account Address:', address);

        // Get account balance
        const balance = await sdk.getAccountBalance(address);
        console.log('Account Balance:', balance);

        return { address, balance };
    } catch (error) {
        console.error('Error getting account info:', error);
        throw error;
    }
}

/**
 * Example 2: Send tokens to another address
 */
async function sendTokensExample() {
    try {
        const senderAddress = await sdk.getAccountAddress();
        const recipientAddress = 'init1dflp5l3p5y6zhh7tnus60j2w88mqhp6p2tpncs';
        const amount = '1000uinit';

        console.log(`Sending ${amount} from ${senderAddress} to ${recipientAddress}`);

        // Create send token message
        const sendMsg = sendToken(
            senderAddress,
            recipientAddress,
            amount
        );

        // Create and sign transaction
        const signedTx = await sdk.wallet.createAndSignTx({
            msgs: [sendMsg],
            memo: 'Sample token transfer',
        });

        // Broadcast transaction
        const result = await sdk.rest.tx.broadcast(signedTx);
        console.log('Transaction result:', result);

        return result;
    } catch (error) {
        console.error('Error sending tokens:', error);
        throw error;
    }
}

/**
 * Example 3: Upload signature with UUID
 */
async function uploadSignatureExample() {
    try {
        const senderAddress = await sdk.getAccountAddress();
        const contractAddress = '0x6f0455e70ee4b792897d552a3e5aa6e89e110782';
        const module = 'agent_tweet_event_aggregate';
        const functionName = 'create';

        // Create a UUID and convert to U256
        const uuid = 'f57956ae-51bf-4ee6-9f5c-b6eeec2bf623'; //This is unique for storing in smart contract
        const requestIdInU256 = uuidToU256(uuid);

        console.log('UUID:', uuid);
        console.log('U256:', requestIdInU256);
        console.log('UUID (reconstructed):', u256ToUuid(requestIdInU256));

        // Create message content
        const encoder = new TextEncoder();
        const messageContent = 'Hello Initia';

        // Create upload signature message
        const msg = uploadSignature(
            senderAddress,
            contractAddress,
            module,
            functionName,
            [], // typeArgs
            [
                bcs.u256().serialize(requestIdInU256).toBase64(),
                bcs.u64().serialize(2112).toBase64(),
                bcs
                    .vector(bcs.u8())
                    .serialize([...encoder.encode(messageContent)])
                    .toBase64(),
            ]
        );

        // Create and sign transaction
        const signedTx = await sdk.wallet.createAndSignTx({
            msgs: [msg],
            memo: 'Sample signature upload',
        });

        // Broadcast transaction
        const result = await sdk.rest.tx.broadcast(signedTx);
        console.log('Transaction result:', result);

        return result;
    } catch (error) {
        console.error('Error uploading signature:', error);
        throw error;
    }
}

/**
 * Example 4: Bridge token
 */
async function bridgeTokenExample() {
    try {
        const senderAddress = await sdk.getAccountAddress();
        const bridgeId = 1152;
        const to = 'init1dflp5l3p5y6zhh7tnus60j2w88mqhp6p2tpncs';
        const amount = new Coin('uinit', '1000000');

        const msg = bridgeToken(
            senderAddress,
            bridgeId,
            to,
            amount
        );

        const signedTx = await sdk.wallet.createAndSignTx({
            msgs: [msg],
            memo: 'Sample token bridge',
        });

        const result = await sdk.rest.tx.broadcast(signedTx);
        console.log('Transaction result:', result);

        return result;
    } catch (error) {
        console.error('Error bridging token:', error);
        throw error;
    }
}

/**
 * Example 5: Bridge out token, usually takes 7 days to complete
 */
async function bridgeOutTokenExample() {
    try {
        // Switch to L2
        const l2ChainId = 'nuwa-rollup-1';
        const l2Config = getChainConfig(l2ChainId);

        const sdk = new InitiaSDK(
            process.env.MNEMONIC ?? '',
            l2ChainId,
            l2Config.rpcUrl
        );

        const senderAddress = await sdk.getAccountAddress();

        const to = 'init1dflp5l3p5y6zhh7tnus60j2w88mqhp6p2tpncs';
        const l2Token = 'l2/6df67ba2b8890ef45c525bdccac4d69e48502e9ee482fac8cc6eb9036c2fb364';
        const amount = new Coin(l2Token, '10000');

        const msg = bridgeOutToken(
            senderAddress,
            to,
            amount
        );

        const signedTx = await sdk.wallet.createAndSignTx({
            msgs: [msg],
            memo: 'Sample token bridge out',
        });

        const result = await sdk.rest.tx.broadcast(signedTx);
        console.log('Transaction result:', result);

        return result;
    } catch (error) {
        console.error('Error bridging out token:', error);
        throw error;
    }
}


/**
 * Main function to run examples
 */
async function main() {
    try {
        console.log('=== Initia SDK Examples ===');

        // Example 1: Get account information
        console.log('\n--- Example 1: Get Account Information ---');
        await getAccountInfo();

        // Example 2: Send tokens
        console.log('\n--- Example 2: Send Tokens ---');
        // Uncomment to execute
        await sendTokensExample();

        // Example 3: Upload signature with UUID
        console.log('\n--- Example 3: Upload Signature with UUID ---');
        // Uncomment to execute
        await uploadSignatureExample();

        // Example 4: Bridge token
        console.log('\n--- Example 4: Bridge Token ---');
        // Execute bridge token example on main chain
        await bridgeTokenExample();

        // Example 5: Bridge out token
        console.log('\n--- Example 5: Bridge Out Token ---');
        // Execute bridge out token example on L2 chain
        await bridgeOutTokenExample();

        console.log('\n=== Examples completed ===');
    } catch (error) {
        console.error('Error in main function:', error);
    }
}

// Run the examples
main();