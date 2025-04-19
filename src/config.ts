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

export const contractConfigs = {
    contractAddress: '0x6a7e1a7e21a1342bdfcb9f21a7c94e39f60b8741',
    TEEPublicKey: '2d852dae1fc60161f3fc53af77fc4a04dcbddbc9b4d0a3b7c4f4d0c71ae01c8f22aa2800e603267356d9a4323b81301a874c01ad7404c0de95b3a60550ea3621'
}

// Helper function to get config based on chain ID
export function getChainConfig(chainId: string) {
    const config = chainConfigs[chainId as keyof typeof chainConfigs];
    if (!config) {
        throw new Error(`Config not found for chain ID: ${chainId}`);
    }
    return config;
}
