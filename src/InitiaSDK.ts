import { RESTClient, Wallet, MnemonicKey } from '@initia/initia.js'
import { chainConfigs, contractConfigs } from './config'
import { bcs } from '@initia/initia.js'

type NetworkType = 'testnet' | 'mainnet';

// Define the chain configuration type
interface ChainConfig {
    rpcUrl: string;
    gasPrices: string;
    gasAdjustment: string;
}

/**
 * Rena Initia SDK
 * 
 * A TypeScript SDK for interacting with the Initia blockchain.
 * This SDK provides a simple interface for common blockchain operations
 * such as getting account information, sending tokens, and uploading signatures.
 */
export class InitiaSDK {
    /** REST client for interacting with the Initia blockchain */
    public rest: RESTClient;

    /** Mnemonic key for wallet operations */
    public key: MnemonicKey;

    /** Wallet instance for signing and broadcasting transactions */
    public wallet: Wallet;

    /** Network type (testnet or mainnet) */
    public network: NetworkType;

    /**
     * Creates a new instance of the InitiaSDK
     * 
     * @param mnemonic - The mnemonic phrase for the wallet
     * @param chainId - The chain ID for the Initia blockchain
     * @param rpcUrl - The RPC URL for the Initia blockchain
     * @param network - The network type ('testnet' or 'mainnet'), defaults to 'testnet'
     */
    constructor(mnemonic: string, network: NetworkType = 'mainnet', chainId: string = 'interwoven-1') {
        this.network = network;

        const networkConfig = chainConfigs[network as keyof typeof chainConfigs];
        if (!networkConfig) {
            throw new Error(`Config not found for network: ${network}`);
        }

        const chainConfig = networkConfig[chainId as keyof typeof networkConfig] as ChainConfig;
        if (!chainConfig) {
            throw new Error(`Config not found for network: ${network}, chain: ${chainId}`);
        }

        this.rest = new RESTClient(chainConfig.rpcUrl, {
            chainId: chainId,
            gasPrices: chainConfig.gasPrices,
            gasAdjustment: chainConfig.gasAdjustment,
        })

        this.key = new MnemonicKey({
            mnemonic: mnemonic, // (optional) if null, generate a new Mnemonic key
            account: 0, // (optional) BIP44 account number. default = 0
            index: 0, // (optional) BIP44 index number. default = 0
            coinType: 60, // (optional) BIP44 coinType. default = 60
        })

        this.wallet = new Wallet(this.rest, this.key)

        console.log(`Public Key: ${this.key.accAddress} is imported`)
        console.log(`Using network: ${network}`)
    }

    /**
     * Gets the account address associated with the wallet
     * 
     * @returns The account address as a string
     */
    async getAccountAddress(): Promise<string> {
        return this.key.accAddress ?? "";
    }

    /**
     * Gets the account balance for a given address
     * 
     * @param address - The account address to get the balance for (defaults to the wallet's address)
     * @returns An array of coin balances with denom and amount
     */
    async getAccountBalance(address: string = this.key.accAddress) {
        const balances = await this.rest.bank.balance(address)
        const coins = balances[0].map(coin => {
            return {
                denom: coin.denom,
                amount: coin.amount
            }
        });
        return coins;
    }

    /**
     * Gets the status of a transaction by its hash
     * 
     * @param txHash - The transaction hash to lookup
     * @returns The transaction status and details
     */
    async getTxStatus(txHash: string) {
        const tx = await this.rest.tx.txInfo(txHash)
        return tx
    }

    /**
     * Gets the TEE public key from the contract
     * 
     * @returns The public key data
     */
    async getTEEPublicKey(network: NetworkType = this.network, version: number = 1) {
        const publicKey = await this.rest.move.view(contractConfigs[network as keyof typeof contractConfigs].teeVerifyContract, 'public_key', 'view_public_key', [], [bcs.u32().serialize(version).toBase64()])
        return publicKey.data;
    }
}