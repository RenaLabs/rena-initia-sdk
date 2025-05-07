// Configuration for different chains
export const chainConfigs = {
    mainnet: {
        'interwoven-1': {
            rpcUrl: 'https://rest.initia.xyz',
            gasPrices: '0.15uinit',
            gasAdjustment: '1.75'
        },
        'rena-nuwa-1': {
            rpcUrl: 'https://rest-rena-nuwa-1.anvil.asia-southeast.initia.xyz',
            gasPrices: '0.15l2/9d3d65bf3329e45ad659f9cbee7d6dc7b6246b001e32131a9b465215eab90562',
            gasAdjustment: '1.75'
        }
    },
    testnet: {
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
    }
};

export const contractConfigs = {
    testnet: {
        teeVerifyContract: '0x6a7e1a7e21a1342bdfcb9f21a7c94e39f60b8741',
        VIPContract: "0xea4f0556c063e4894e934602a971625c700df97b"
    },
    mainnet: {
        teeVerifyContract: '0xac63133dbfc37bd52f21b2414f1944ddc2558ece',
        VIPContract: "0xea4f0556c063e4894e934602a971625c700df97b"
    },
}

export const TeePublicKeyVersionManager = {
    1: '1235a513eaa3fef0651866a11e9bd9e2eab63824f5fb3aaa13f85d9cc9a48025a695675097cc2badaacc66505cb5367144cbb8690e91c1b19d631c0ce3a4c012',
    2: '6b1c4baecda26b7a414409825e6cd546ba35b6649fbfc919bc82e6136f3c4d5d9f45e849a0f277310063b8b187b7ae4d5d6dc81fa87448be08b794053107a0c9'
}

// Helper function to get config based on chain ID
export function getChainConfig(chainId: string) {
    const config = chainConfigs[chainId as keyof typeof chainConfigs];
    if (!config) {
        throw new Error(`Config not found for chain ID: ${chainId}`);
    }
    return config;
}
