import { InitiaSDK } from './src/InitiaSDK';
import dotenv from 'dotenv';
import { sendToken, bridgeToken, bridgeOutToken, initializePublicKey, verifySignature, hexToString, updatePublicKey } from './src/tee';
import { bcs, Coin, MsgExecute } from '@initia/initia.js';
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
        process.env.MNEMONIC_2 ?? '',
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

const toBcsVector = (data: string | Buffer, format: 'utf-8' | 'hex' = 'hex') => {
    const buffer = typeof data === 'string'
        ? Buffer.from(data, format)
        : data;

    return bcs.vector(bcs.u8()).serialize(Array.from(buffer)).toBase64();
};

const main = async () => {

    const address = await rollupSdk.getAccountAddress();
    console.log(address);

    // const msg = new MsgExecute(
    //     address,
    //     contractConfigs.vipContractAddress,
    //     'vip_score',
    //     'set_init_stage',
    //     undefined,
    //     [
    //         bcs.u64().serialize(1).toBase64(),
    //     ]
    // )

    const msg = new MsgExecute(
        address,
        contractConfigs.vipContractAddress,
        'vip_score',
        'update_score_script',
        undefined,
        [
            bcs.u64().serialize(1).toBase64(),
            bcs.vector(bcs.address()).serialize(['init1af8s24kqv0jgjn5ngcp2jutzt3cqm7tm75lczz', 'init1dflp5l3p5y6zhh7tnus60j2w88mqhp6p2tpncs']).toBase64(),
            bcs.vector(bcs.u64()).serialize([3, 5]).toBase64(),
        ]
    )

    const result = await signAndBroadcast(rollupSdk, [msg], 'initialize vip');
    console.log(result);
}

main();