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
    vipContractAddress: '0xea4f0556c063e4894e934602a971625c700df97b',
    TEEPublicKey: '1235a513eaa3fef0651866a11e9bd9e2eab63824f5fb3aaa13f85d9cc9a48025a695675097cc2badaacc66505cb5367144cbb8690e91c1b19d631c0ce3a4c012'
}

// Helper function to get config based on chain ID
export function getChainConfig(chainId: string) {
    const config = chainConfigs[chainId as keyof typeof chainConfigs];
    if (!config) {
        throw new Error(`Config not found for chain ID: ${chainId}`);
    }
    return config;
}
