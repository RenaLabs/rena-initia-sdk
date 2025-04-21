import { InitiaSDK } from './src/InitiaSDK';
import dotenv from 'dotenv';
import { sendToken, bridgeToken, bridgeOutToken, initializePublicKey, verifySignature, hexToString, updatePublicKey } from './src/tee';
import { bcs, Coin } from '@initia/initia.js';
import { contractConfigs, getChainConfig } from './src/config';

// Load environment variables from .env file
dotenv.config();

// Chain configuration
const CHAINS = {
    MAIN: {
        id: 'initiation-2',
        recipientAddress: 'init1dflp5l3p5y6zhh7tnus60j2w88mqhp6p2tpncs',
    },
    ROLLUP: {
        id: 'nuwa-rollup-1',
    }
};

// SDK initialization function
const createSdk = (chainId: string) => {
    const config = getChainConfig(chainId);
    return new InitiaSDK(
    process.env.MNEMONIC ?? '',
        chainId,
        config.rpcUrl
    );
};

// Initialize SDKs
const mainSdk = createSdk(CHAINS.MAIN.id);
const rollupSdk = createSdk(CHAINS.ROLLUP.id);

// Utility function for standardized transaction signing and broadcasting
const signAndBroadcast = async (sdk: InitiaSDK, msgs: any[], memo: string) => {
    try {
        const signedTx = await sdk.wallet.createAndSignTx({
            msgs,
            memo,
        });
        const result = await sdk.rest.tx.broadcast(signedTx);
        console.log('Transaction result:', result);
        return result;
    } catch (error) {
        console.error(`Error in transaction: ${error}`);
        throw error;
    }
};

// Convert data to BCS format for contract calls
const toBcsVector = (data: string | Buffer, format: 'utf-8' | 'hex' = 'hex') => {
    const buffer = typeof data === 'string'
        ? Buffer.from(data, format)
        : data;

    return bcs.vector(bcs.u8()).serialize(Array.from(buffer)).toBase64();
};

/**
 * Example 1: Get account information
 */
async function getAccountInfo() {
    try {
        const address = await mainSdk.getAccountAddress();
        console.log('Account Address:', address);

        const balance = await mainSdk.getAccountBalance(address);
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
        const senderAddress = await mainSdk.getAccountAddress();
        const recipientAddress = CHAINS.MAIN.recipientAddress;
        const amount = '1000uinit';

        console.log(`Sending ${amount} from ${senderAddress} to ${recipientAddress}`);

        const sendMsg = sendToken(senderAddress, recipientAddress, amount);

        return await signAndBroadcast(mainSdk, [sendMsg], 'Sample token transfer');
    } catch (error) {
        console.error('Error sending tokens:', error);
        throw error;
    }
}

/**
 * Example 3: Bridge token to L2
 */
async function bridgeTokenExample() {
    try {
        const senderAddress = await mainSdk.getAccountAddress();
        const bridgeId = 1152;
        const to = CHAINS.MAIN.recipientAddress;
        const amount = new Coin('uinit', '1000000');

        const msg = bridgeToken(senderAddress, bridgeId, to, amount);

        return await signAndBroadcast(mainSdk, [msg], 'Sample token bridge');
    } catch (error) {
        console.error('Error bridging token:', error);
        throw error;
    }
}

/**
 * Example 4: Bridge out token from L2 to L1, usually takes 7 days to complete
 */
async function bridgeOutTokenExample() {
    try {
        const l2Sdk = createSdk(CHAINS.ROLLUP.id);
        const senderAddress = await l2Sdk.getAccountAddress();
        const to = CHAINS.MAIN.recipientAddress;
        const l2Token = 'l2/6df67ba2b8890ef45c525bdccac4d69e48502e9ee482fac8cc6eb9036c2fb364';
        const amount = new Coin(l2Token, '10000');

        const msg = bridgeOutToken(senderAddress, to, amount);

        return await signAndBroadcast(l2Sdk, [msg], 'Sample token bridge out');
    } catch (error) {
        console.error('Error bridging out token:', error);
        throw error;
    }
}

/**
 * Example 5: Initialize public key in TEE
 */
async function initializePublicKeyExample() {
    try {
        const senderAddress = await rollupSdk.getAccountAddress();
        const publicKeyHex = contractConfigs.TEEPublicKey;
        const args = [toBcsVector(publicKeyHex)];

        const msg = initializePublicKey(senderAddress, args);

        return await signAndBroadcast(rollupSdk, [msg], 'Sample public key initialization');
    } catch (error) {
        console.error('Error initializing public key:', error);
        throw error;
    }
}

/**
 * Example 6: Verify a signature on L2
 */
async function verifySignatureExample() {
    try {
        const publicKey = await rollupSdk.getTEEPublicKey();
        console.log('Public Key:', publicKey);

        const l2Sdk = createSdk(CHAINS.ROLLUP.id);
        const senderAddress = await l2Sdk.getAccountAddress();

        // Sample data
        const requestId = '1f961e1f-cef8-40da-bfa6-6e44e8791a85';
        const message = {
            mediaIds: null,
            replyTweetId: "",
            text: "\"Spotted the fluffies staging a coup for the comfiest sunbeam. Their manifesto? More belly rubs, fewer Mondays. Rebel leadership applications open til sunset.\"",
            timestamp: 1745074851,
            tweetId: "1913608741510959318"
        };
        const signature = '2b1f9aee68e1a1b131b6b7142af0aeb52567e84faa6058db3a2e7e75a5a668b831a5564151a913c43d2dadb641428049069a11c08accbd8446713a9d65930ba11c';
        const timestamp = 1745089251;

        // Data preparation
        const requestIdHex = Buffer.from(requestId, 'utf-8').toString('hex');
        const messageInBase64 = Buffer.from(JSON.stringify(message)).toString('base64');
        const messageHex = Buffer.from(messageInBase64, 'utf-8').toString('hex');

        // Prepare arguments
        const args = [
            toBcsVector(requestIdHex),
            toBcsVector(messageHex),
            toBcsVector(signature),
            bcs.u64().serialize(timestamp).toBase64(),
        ];

        const msg = verifySignature(senderAddress, args);

        return await signAndBroadcast(l2Sdk, [msg], 'Sample signature verification');
    } catch (error) {
        console.error('Error verifying signature:', error);
        throw error;
    }
}

//Error code 100: invalid request - Cannot verify signature
//Error code 101: duplicate request


/**
 * Example 7: Get transaction status
 */
async function getTxStatus(txHash = '051A2BF39B70C0218E1172846E17DF158E1135E12922DC7BB24639EF98FC126C') {
    try {
        const tx = await mainSdk.getTxStatus(txHash);
        console.log('Transaction status:', tx);
        return tx;
    } catch (error) {
        console.error('Error getting transaction status:', error);
        throw error;
    }
}

/** Example 8: Update public key in TEE */
async function updatePublicKeyExample() {
    try {
        const senderAddress = await rollupSdk.getAccountAddress();
        const publicKeyHex = contractConfigs.TEEPublicKey;
        const args = [toBcsVector(publicKeyHex)];

        const msg = updatePublicKey(senderAddress, args);

        return await signAndBroadcast(rollupSdk, [msg], 'Sample public key update');
    } catch (error) {
        console.error('Error updating public key:', error);
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

        // Uncomment example functions below to execute them

        // console.log('\n--- Example 2: Send Tokens ---');
        // await sendTokensExample();

        // console.log('\n--- Example 3: Bridge Token to L2 ---');
        // await bridgeTokenExample();

        // console.log('\n--- Example 4: Bridge Out Token from L2 ---');
        // await bridgeOutTokenExample();

        // console.log('\n--- Example 5: Initialize Public Key ---');
        // await initializePublicKeyExample();

        console.log('\n--- Example 6: Verify Signature on L2 ---');
        // await verifySignatureExample();

        // console.log('\n--- Example 7: Get Transaction Status ---');
        await getTxStatus();

        console.log('\n--- Example 8: Update Public Key ---');
        // await updatePublicKeyExample();
        const publicKey = await rollupSdk.getTEEPublicKey();
        console.log('Current Public Key:', publicKey);

        console.log('\n=== Examples completed ===');
    } catch (error) {
        console.error('Error in main function:', error);
        process.exit(1);
    }
}

// Run the examples
main();