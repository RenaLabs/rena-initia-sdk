import { InitiaSDK } from './src/InitiaSDK';
import dotenv from 'dotenv';
import { sendToken, bridgeToken, bridgeOutToken, verifySignature, hexToString, createPublicKey } from './src/tee';
import { updateVIPStage } from './src/vip';
import { bcs, Coin, MsgUpdateACL, AccAddress, MsgExecuteMessages } from '@initia/initia.js';
import { contractConfigs, chainConfigs, TeePublicKeyVersionManager } from './src/config';

// Load environment variables from .env file
dotenv.config();

// Chain configuration for testnet
const NETWORK: 'testnet' | 'mainnet' = 'testnet';
const CHAINS = {
    MAIN: {
        id: 'interwoven-1',
        recipientAddress: 'init1dflp5l3p5y6zhh7tnus60j2w88mqhp6p2tpncs',
    },
    MAINNETROLLUP: {
        id: 'rena-nuwa-1',
    },
    ROLLUP: {
        id: 'nuwa-rollup-1',
    },
    TESTNETMAIN: {
        id: 'initiation-2',
    },

};

// SDK initialization function


// Initialize SDKs
const mainnetRollupSdk = new InitiaSDK(process.env.MNEMONIC_2 ?? '', 'mainnet', CHAINS.MAINNETROLLUP.id);
const mainnetl1Sdk = new InitiaSDK(process.env.MNEMONIC ?? '', 'mainnet', CHAINS.MAIN.id);
const testnetrollupSdk = new InitiaSDK(process.env.MNEMONIC ?? '', 'testnet', CHAINS.ROLLUP.id);
const testnetl1Sdk = new InitiaSDK(process.env.MNEMONIC ?? '', 'testnet', CHAINS.TESTNETMAIN.id);

// Utility function for standardized transaction signing and broadcasting
const signAndBroadcast = async (sdk: InitiaSDK, msgs: any[], memo: string = "") => {
    try {
        const signedTx = await sdk.wallet.createAndSignTx({
            msgs,
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
        const address = await testnetrollupSdk.getAccountAddress();
        console.log('Account Address:', address);

        const balance = await testnetrollupSdk.getAccountBalance();
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
        const senderAddress = await testnetl1Sdk.getAccountAddress();
        const recipientAddress = CHAINS.MAIN.recipientAddress;
        const amount = '1000uinit';

        console.log(`Sending ${amount} from ${senderAddress} to ${recipientAddress}`);

        const sendMsg = sendToken(senderAddress, recipientAddress, amount);

        return await signAndBroadcast(testnetl1Sdk, [sendMsg], 'Sample token transfer');
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
        const senderAddress = await mainnetl1Sdk.getAccountAddress();
        // Bridge ID for testnet - may need to be updated based on actual testnet bridge ID
        const bridgeId = 30;
        const to = CHAINS.MAIN.recipientAddress;
        const amount = new Coin('uinit', '1000000');

        const msg = bridgeToken(senderAddress, bridgeId, senderAddress, amount);

        return await signAndBroadcast(mainnetl1Sdk, [msg], 'Sample token bridge');
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
        const l2Sdk = testnetrollupSdk;
        const senderAddress = await l2Sdk.getAccountAddress();
        const to = CHAINS.MAIN.recipientAddress;
        // Using testnet L2 token address
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
        const senderAddress = await testnetl1Sdk.getAccountAddress();
        const network = 'testnet';
        const publicKeyHex = TeePublicKeyVersionManager[1];
        const args = [toBcsVector(publicKeyHex)];

        const msg = createPublicKey(senderAddress, args, network);

        return await signAndBroadcast(testnetl1Sdk, [msg], 'Sample public key initialization');
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
        const publicKey = await mainnetRollupSdk.getTEEPublicKey();
        console.log('Public Key:', publicKey);

        const l2Sdk = mainnetRollupSdk;
        const senderAddress = await l2Sdk.getAccountAddress();
        console.log('Sender Address:', senderAddress);
        // Sample data
        const requestId = '1f961e1f-cef8-40da-bfa6-6e44e8791a85';
        // const message = {
        //     mediaIds: null,
        //     replyTweetId: "",
        //     text: "\"Spotted the fluffies staging a coup for the comfiest sunbeam. Their manifesto? More belly rubs, fewer Mondays. Rebel leadership applications open til sunset.\"",
        //     timestamp: 1745074851,
        //     tweetId: "1913608741510959318"
        // };
        const signature = 'ae98ff54f1fa1e3531735b04d3b17e484ed5a16fecf2b44ecddab5b8b4660ad908784aa85cd24394c6cc85bee30b74fdc4b16317377c54ed51769f13dac67ac01b';
        const timestamp = 1745089251;

        // Data preparation
        const requestIdHex = Buffer.from(requestId, 'utf-8').toString('hex');
        const messageInBase64 = 'eyJtZWRpYUlkcyI6bnVsbCwicmVwbHlUd2VldElkIjoiIiwidGV4dCI6IkNlbGVicmF0aW5nIGFub3RoZXIgbWlsZXN0b25lIHdpdGggdGhlIHRlYW0gdG9kYXkuIFRoZSBqb3VybmV54oCZcyBiZWVuIHdpbGQsIGJ1dCBidWlsZGluZyBzb21ldGhpbmcgdGhhdCBhY3R1YWxseSBoZWxwcyBwZW9wbGUgbWFrZXMgaXQgYWxsIHdvcnRoIGl0LiBXaGF04oCZcyBuZXh0PyBMZXTigJlzIGtlZXAgcHVzaGluZyBib3VuZGFyaWVzLCB5YSBrbm93PyIsInRpbWVzdGFtcCI6MTc0NTIwMDgxNywidHdlZXRJZCI6IjE5MTQxMzcwNzk4MzY5OTE3MjkifQ==';
        const messageHex = Buffer.from(messageInBase64, 'utf-8').toString('hex');

        // Prepare arguments
        const args = [
            toBcsVector(requestIdHex),
            bcs.u32().serialize(1).toBase64(), //version number
            toBcsVector(messageHex),
            toBcsVector(signature),
            bcs.u64().serialize(timestamp).toBase64(),
        ];

        const msg = verifySignature(senderAddress, args, 'mainnet');

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
        const tx = await testnetrollupSdk.getTxStatus(txHash);
        console.log('Transaction status:', tx);
        return tx;
    } catch (error) {
        console.error('Error getting transaction status:', error);
        throw error;
    }
}

/** Example 8: Update public key from TEE */
async function updatePublicKeyExample() {
    try {
        const senderAddress = await mainnetRollupSdk.getAccountAddress();
        const network = 'mainnet';
        const publicKeyHex = TeePublicKeyVersionManager[2];
        const args = [bcs.u32().serialize(2).toBase64(), toBcsVector(publicKeyHex)];

        const msg = createPublicKey(senderAddress, args, network);

        return await signAndBroadcast(mainnetRollupSdk, [msg], 'public key update');
    } catch (error) {
        console.error('Error updating public key:', error);
        throw error;
    }
}

/**
 * Example 9: Update VIP stage
 */
async function updateVIPStageExample() {
    try {
        const senderAddress = await mainnetRollupSdk.getAccountAddress();
        const network = 'mainnet';
        const args = [
            bcs.u64().serialize(0).toBase64(),
        ];

        const msg = updateVIPStage(senderAddress, args, network);

        return await signAndBroadcast(mainnetRollupSdk, [msg], 'Sample VIP stage update');
    } catch (error) {
        console.error('Error updating VIP stage:', error);
        throw error;
    }
}


async function setACLList() {

    const senderAddress = await mainnetRollupSdk.getAccountAddress();
    console.log(senderAddress);

    const msg = new MsgExecuteMessages(senderAddress, [
        // The key must be an admin key
        new MsgUpdateACL(
            'init1gz9n8jnu9fgqw7vem9ud67gqjk5q4m2w0aejne',
            'init18d5t3pe4rvpm7mezh4apdvanpxej2jxz2jvl4d',
            true,
        ),
    ]);

    // const msg = new MsgUpdateACL('init18d5t3pe4rvpm7mezh4apdvanpxej2jxz2jvl4d', AccAddress.fromHex('0x3b68b887351b03bf6f22bd7a16b3b309b32548c2'), true);
    console.log(msg);
    const tx = await signAndBroadcast(mainnetRollupSdk, [msg]);
    console.log(tx);
}
/**
 * Main function to run examples
 */
async function main() {
    try {
        console.log(`=== Initia SDK Examples (${NETWORK.charAt(0).toUpperCase() + NETWORK.slice(1)}) ===`);
        console.log(`Network: ${NETWORK}`);
        console.log(`Main Chain: ${CHAINS.MAIN.id}`);
        console.log(`Rollup Chain: ${CHAINS.ROLLUP.id}`);

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

        // console.log('\n--- Example 6: Verify Signature on L2 ---');
        // await verifySignatureExample();

        // console.log('\n--- Example 7: Get Transaction Status ---');
        // await getTxStatus();

        console.log('\n--- Example 8: Update Public Key ---');
        await updatePublicKeyExample();
        const publicKey = await mainnetRollupSdk.getTEEPublicKey('mainnet', 2);
        console.log(publicKey);

        // console.log('\n--- Example 9: Update VIP Stage ---');
        // await updateVIPStageExample();

        // console.log('\n--- Example 10: Set ACL List ---');
        // await setACLList();

        console.log('\n=== Examples completed ===');
    } catch (error) {
        console.error('Error in main function:', error);
        process.exit(1);
    }
}

// Run the examples
main();