import { RESTClient } from '@initia/initia.js'
import { MnemonicKey, Wallet } from '@initia/initia.js'

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

    /**
     * Creates a new instance of the InitiaSDK
     * 
     * @param mnemonic - The mnemonic phrase for the wallet
     * @param rpcUrl - The RPC URL for the Initia blockchain (defaults to testnet)
     */
    constructor(mnemonic: string, rpcUrl: string) {
        this.rest = new RESTClient(rpcUrl, {
            chainId: 'initiation-2',
            gasPrices: '0.15uinit', // default gas prices
            gasAdjustment: '1.75',  // default gas adjustment for fee estimation
        })

        this.key = new MnemonicKey({
            mnemonic: mnemonic, // (optional) if null, generate a new Mnemonic key
            account: 0, // (optional) BIP44 account number. default = 0
            index: 0, // (optional) BIP44 index number. default = 0
            coinType: 60, // (optional) BIP44 coinType. default = 60
        })

        this.wallet = new Wallet(this.rest, this.key)

        console.log(`Public Key: ${this.key.accAddress} is imported`)
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
}