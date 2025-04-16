// Configuration for different chains
export const chainConfigs = {
    'initiation-2': {
        rpcUrl: 'https://rest.testnet.initia.xyz',
        gasPrices: '0.15uinit',
        gasAdjustment: '1.75'
    },
    'nuwa-rollup-1': {
        rpcUrl: 'https://rest-nuwa-rollup-1.anvil.asia-southeast.initia.xyz',
        gasPrices: '0.1l2/6df67ba2b8890ef45c525bdccac4d69e48502e9ee482fac8cc6eb9036c2fb364',
        gasAdjustment: '1.75'
    }
};

// Helper function to get config based on chain ID
export function getChainConfig(chainId: string) {
    const config = chainConfigs[chainId as keyof typeof chainConfigs];
    if (!config) {
        throw new Error(`Config not found for chain ID: ${chainId}`);
    }
    return config;
}
